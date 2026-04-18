import express from 'express';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import Sheet from '../models/Sheet.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Teacher: get all students in their class with aggregated stats
router.get('/class', verifyToken, requireRole('teacher'), async (req, res) => {
  try {
    const students = await User.find({ classCode: req.user.myClassCode, role: 'student' }).select('name email avatar leetcodeUsername');
    const ids = students.map(s => s._id);
    const progresses = await Progress.find({ student: { $in: ids } });

    const data = students.map(student => {
      const p = progresses.find(pr => pr.student.toString() === student._id.toString());
      return {
        student: { _id: student._id, name: student.name, email: student.email, avatar: student.avatar, leetcodeUsername: student.leetcodeUsername },
        leetcode: p?.leetcode || null,
        sheetProgress: p?.sheetProgress || [],
      };
    });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Topic success rate across class (for teacher heatmap)
router.get('/topics', verifyToken, requireRole('teacher'), async (req, res) => {
  try {
    const students = await User.find({ classCode: req.user.myClassCode, role: 'student' }).select('_id');
    const progresses = await Progress.find({ student: { $in: students.map(s => s._id) } });

    const topicTotals = {};
    for (const p of progresses) {
      if (!p.leetcode?.topicStats) continue;
      for (const [topic, count] of p.leetcode.topicStats) {
        topicTotals[topic] = (topicTotals[topic] || 0) + count;
      }
    }
    const topicArray = Object.entries(topicTotals)
      .map(([topic, total]) => ({ topic, total, avg: +(total / (progresses.length || 1)).toFixed(1) }))
      .sort((a, b) => b.total - a.total);

    res.json(topicArray);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;