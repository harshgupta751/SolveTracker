import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { fetchLeetCodeStats, verifyProblemSolved } from '../utils/leetcode.js';
import Progress from '../models/Progress.js';
import User from '../models/User.js';


const router = express.Router();

// ─── Sync LeetCode data for the logged-in student ────────────────────────────
router.post('/sync', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.leetcodeUsername)
      return res.status(400).json({ message: 'Set your LeetCode username first in profile.' });

    const stats = await fetchLeetCodeStats(user.leetcodeUsername);
    if (stats.error) return res.status(502).json({ message: stats.error });

    const progress = await Progress.findOneAndUpdate(
      { student: user._id },
      { $set: { leetcode: { ...stats, lastSynced: new Date() } } },
      { new: true, upsert: true }
    );

    res.json({ message: 'Synced successfully!', leetcode: progress.leetcode });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get cached LeetCode stats (no re-fetch) ──────────────────────────────────
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const progress = await Progress.findOne({ student: req.user._id });
    res.json({ leetcode: progress?.leetcode || null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get any student's stats (teacher use) ───────────────────────────────────
router.get('/stats/:studentId', verifyToken, async (req, res) => {
  try {
    const progress = await Progress.findOne({ student: req.params.studentId });
    res.json({ leetcode: progress?.leetcode || null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/leetcode/verify-problem
router.post('/verify-problem', verifyToken, async (req, res) => {
  try {
    const { titleSlug, sheetId, problemIdx } = req.body;
    if (!titleSlug) return res.status(400).json({ message: 'titleSlug required' });

    const user = await User.findById(req.user._id);
    if (!user.leetcodeUsername)
      return res.status(400).json({ message: 'Set your LeetCode username in profile first' });

    const result = await verifyProblemSolved(user.leetcodeUsername, titleSlug);

    if (!result.solved) {
      return res.json({
        solved: false,
        message: "Not found in your last 100 LeetCode submissions. Solve it on LeetCode first!",
      });
    }

    // Verified — mark as complete + verified in progress
    if (sheetId && problemIdx !== undefined) {
      let progress = await Progress.findOne({ student: req.user._id });
      if (!progress) progress = await Progress.create({ student: req.user._id });

      const idx = Number(problemIdx);
      let sp = progress.sheetProgress.find((s) => s.sheet.toString() === sheetId);

      if (!sp) {
        progress.sheetProgress.push({
          sheet: sheetId,
          completedProblems: [idx],
          verifiedProblems:  [idx],
        });
      } else {
        if (!sp.completedProblems.includes(idx)) sp.completedProblems.push(idx);
        if (!sp.verifiedProblems)                sp.verifiedProblems = [];
        if (!sp.verifiedProblems.includes(idx))  sp.verifiedProblems.push(idx);
        sp.lastUpdated = new Date();
      }

      await progress.save();
      const fresh = await Progress.findOne({ student: req.user._id });
      return res.json({ solved: true, sheetProgress: fresh.sheetProgress });
    }

    res.json({ solved: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;