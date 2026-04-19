import express from 'express';
import Sheet    from '../models/Sheet.js';
import Progress from '../models/Progress.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// ─── Teacher: Create sheet ────────────────────────────────────────────────────
router.post('/', verifyToken, requireRole('teacher'), async (req, res) => {
  try {
    const sheet = await Sheet.create({
      ...req.body,
      createdBy: req.user._id,
      classCode: req.user.myClassCode,
    });
    res.status(201).json(sheet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Teacher: Update sheet ───────────────────────────────────────────────────
router.put('/:id', verifyToken, requireRole('teacher'), async (req, res) => {
  try {
    const sheet = await Sheet.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true }
    );
    if (!sheet) return res.status(404).json({ message: 'Sheet not found' });
    res.json(sheet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Teacher: Delete sheet ───────────────────────────────────────────────────
router.delete('/:id', verifyToken, requireRole('teacher'), async (req, res) => {
  try {
    await Sheet.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Student/Teacher: Get all sheets for class ───────────────────────────────
router.get('/my', verifyToken, async (req, res) => {
  try {
    const classCode = req.user.role === 'student'
      ? req.user.classCode
      : req.user.myClassCode;

    if (!classCode) return res.json([]);

    const sheets = await Sheet.find({ classCode, isPublished: true }).sort('-createdAt');
    res.json(sheets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Teacher: Get ALL sheets (published + drafts) for their class ─────────────
router.get('/teacher-all', verifyToken, requireRole('teacher'), async (req, res) => {
  try {
    const sheets = await Sheet.find({ createdBy: req.user._id }).sort('-createdAt');
    res.json(sheets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Student: TOGGLE problem complete/incomplete ─────────────────────────────
// POST /sheets/:sheetId/toggle/:problemIdx
router.post('/:sheetId/toggle/:problemIdx', verifyToken, async (req, res) => {
  try {
    const { sheetId, problemIdx } = req.params;
    const idx = Number(problemIdx);

    let progress = await Progress.findOne({ student: req.user._id });
    if (!progress) {
      progress = await Progress.create({ student: req.user._id });
    }

    // Find existing sheet progress record
    let sp = progress.sheetProgress.find(
      (s) => s.sheet.toString() === sheetId
    );

    if (!sp) {
      // First time touching this sheet
      progress.sheetProgress.push({ sheet: sheetId, completedProblems: [idx] });
    } else {
      const pos = sp.completedProblems.indexOf(idx);
      if (pos === -1) {
        // Not done → mark done
        sp.completedProblems.push(idx);
      } else {
        // Already done → unmark
        sp.completedProblems.splice(pos, 1);
      }
      sp.lastUpdated = new Date();
    }

    await progress.save();
    res.json({ sheetProgress: progress.sheetProgress });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Student: Get my progress across all sheets ──────────────────────────────
router.get('/progress/me', verifyToken, async (req, res) => {
  try {
    const progress = await Progress.findOne({ student: req.user._id });
    res.json({ sheetProgress: progress?.sheetProgress ?? [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;