import express from 'express';
import Sheet from '../models/Sheet.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Teacher: Create sheet
router.post('/', verifyToken, requireRole('teacher'), async (req, res) => {
  try {
    const sheet = await Sheet.create({ ...req.body, createdBy: req.user._id, classCode: req.user.myClassCode });
    res.status(201).json(sheet);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Teacher: Update sheet
router.put('/:id', verifyToken, requireRole('teacher'), async (req, res) => {
  try {
    const sheet = await Sheet.findOneAndUpdate({ _id: req.params.id, createdBy: req.user._id }, req.body, { new: true });
    if (!sheet) return res.status(404).json({ message: 'Sheet not found' });
    res.json(sheet);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Teacher: Delete sheet
router.delete('/:id', verifyToken, requireRole('teacher'), async (req, res) => {
  try {
    await Sheet.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Student: Get all sheets for their class
router.get('/my', verifyToken, async (req, res) => {
  try {
    const classCode = req.user.role === 'student' ? req.user.classCode : req.user.myClassCode;
    const sheets = await Sheet.find({ classCode, isPublished: true }).sort('-createdAt');
    res.json(sheets);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Mark problem done (student)
router.post('/:sheetId/complete/:problemIdx', verifyToken, async (req, res) => {
  try {
    const { sheetId, problemIdx } = req.params;
    const Progress = (await import('../models/Progress.js')).default;
    const progress = await Progress.findOne({ student: req.user._id });

    let sp = progress.sheetProgress.find(s => s.sheet.toString() === sheetId);
    if (!sp) { progress.sheetProgress.push({ sheet: sheetId, completedProblems: [] }); sp = progress.sheetProgress.at(-1); }

    const idx = Number(problemIdx);
    if (!sp.completedProblems.includes(idx)) sp.completedProblems.push(idx);
    sp.lastUpdated = new Date();
    await progress.save();
    res.json({ sheetProgress: progress.sheetProgress });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;