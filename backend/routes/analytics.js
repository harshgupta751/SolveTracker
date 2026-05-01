import express from 'express';
import User     from '../models/User.js';
import Progress from '../models/Progress.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// ─── Shared helper: fetch class data for a given classCode ───────────────────
async function buildClassData(classCode) {
  const students = await User.find({ classCode, role: 'student' })
    .select('name email avatar leetcodeUsername');
  const ids       = students.map((s) => s._id);
  const progresses = await Progress.find({ student: { $in: ids } });

  return students.map((student) => {
    const p = progresses.find(
      (pr) => pr.student.toString() === student._id.toString()
    );
    return {
      student: {
        _id:              student._id,
        name:             student.name,
        email:            student.email,
        avatar:           student.avatar,
        leetcodeUsername: student.leetcodeUsername,
      },
      leetcode:      p?.leetcode   ?? null,
      sheetProgress: p?.sheetProgress ?? [],
    };
  });
}

// ─── Teacher: full class breakdown ───────────────────────────────────────────
router.get('/class', verifyToken, requireRole('teacher'), async (req, res) => {
  try {
    const data = await buildClassData(req.user.myClassCode);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Student OR Teacher: leaderboard for the student's class ─────────────────
// Students can see their own class leaderboard without teacher privileges
router.get('/leaderboard', verifyToken, async (req, res) => {
  try {
    // Determine the classCode from context
    let classCode;
    if (req.user.role === 'teacher') {
      classCode = req.user.myClassCode;
    } else {
      classCode = req.user.classCode;
    }

    if (!classCode) return res.json([]);

    const data = await buildClassData(classCode);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Teacher: topic success rates ────────────────────────────────────────────
router.get('/topics', verifyToken, requireRole('teacher'), async (req, res) => {
  try {
    const students = await User.find({
      classCode: req.user.myClassCode,
      role: 'student',
    }).select('_id');

    const progresses = await Progress.find({
      student: { $in: students.map((s) => s._id) },
    });

    const topicTotals = {};
    for (const p of progresses) {
      if (!p.leetcode?.topicStats) continue;
      const entries =
        p.leetcode.topicStats instanceof Map
          ? p.leetcode.topicStats.entries()
          : Object.entries(p.leetcode.topicStats);
      for (const [topic, count] of entries) {
        topicTotals[topic] = (topicTotals[topic] || 0) + count;
      }
    }

    const count = progresses.length || 1;
    const topicArray = Object.entries(topicTotals)
      .map(([topic, total]) => ({
        topic,
        total,
        avg: +(total / count).toFixed(1),
      }))
      .sort((a, b) => b.total - a.total);

    res.json(topicArray);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/topic-students?topic=Arrays
router.get('/topic-students', verifyToken, requireRole('teacher'), async (req, res) => {
  try {
    const { topic } = req.query;
    if (!topic) return res.status(400).json({ message: 'topic query param required' });

    const students   = await User.find({ classCode: req.user.myClassCode, role: 'student' })
                                 .select('name email avatar leetcodeUsername');
    const ids        = students.map(s => s._id);
    const progresses = await Progress.find({ student: { $in: ids } });

    const rows = students.map(student => {
      const p   = progresses.find(pr => pr.student.toString() === student._id.toString());
      const ts  = p?.leetcode?.topicStats;
      const map = ts instanceof Map ? Object.fromEntries(ts) : ts ?? {};
      const count = map[topic] ?? 0;
      return {
        student: {
          _id:              student._id,
          name:             student.name,
          email:            student.email,
          avatar:           student.avatar,
          leetcodeUsername: student.leetcodeUsername,
        },
        topicCount:    count,
        totalSolved:   p?.leetcode?.totalSolved   ?? 0,
        acceptanceRate:p?.leetcode?.acceptanceRate ?? 0,
        lastSynced:    p?.leetcode?.lastSynced     ?? null,
      };
    });

    // Sort desc by topicCount
    rows.sort((a, b) => b.topicCount - a.topicCount);

    const synced  = rows.filter(r => r.lastSynced);
    const counts  = synced.map(r => r.topicCount);
    const avg     = counts.length ? counts.reduce((a, b) => a + b, 0) / counts.length : 0;

    // Categorise
    const categorised = rows.map(r => {
      let category;
      if (!r.lastSynced)              category = 'unsynced';
      else if (r.topicCount >= Math.max(avg * 1.35, 1) && r.topicCount > 0) category = 'gallant';
      else if (r.topicCount > 0 && r.topicCount >= avg * 0.6)               category = 'average';
      else                                                                   category = 'gradual';
      return { ...r, category };
    });

    res.json({
      topic,
      classAvg:    +avg.toFixed(1),
      total:       rows.length,
      categorised,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;