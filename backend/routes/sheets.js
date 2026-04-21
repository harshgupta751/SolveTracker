import express  from 'express';
import Sheet    from '../models/Sheet.js';
import Progress from '../models/Progress.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// ══════════════════════════════════════════════════════════════════
//  TEACHER SHEET ROUTES
// ══════════════════════════════════════════════════════════════════

router.post('/', verifyToken, requireRole('teacher'), async (req, res) => {
  try {
    const sheet = await Sheet.create({
      ...req.body,
      createdBy: req.user._id,
      classCode: req.user.myClassCode,
      isPersonal: false,
    });
    res.status(201).json(sheet);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', verifyToken, requireRole('teacher'), async (req, res) => {
  try {
    const sheet = await Sheet.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body, { new: true }
    );
    if (!sheet) return res.status(404).json({ message: 'Sheet not found' });
    res.json(sheet);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', verifyToken, requireRole('teacher'), async (req, res) => {
  try {
    await Sheet.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// All teacher's sheets (drafts + published)
router.get('/teacher-all', verifyToken, requireRole('teacher'), async (req, res) => {
  try {
    const sheets = await Sheet.find({
      createdBy:  req.user._id,
      isPersonal: false,
    }).sort('-createdAt');
    res.json(sheets);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Student: class sheets (published, non-personal)
router.get('/my', verifyToken, async (req, res) => {
  try {
    const classCode = req.user.role === 'student'
      ? req.user.classCode
      : req.user.myClassCode;
    if (!classCode) return res.json([]);
    const sheets = await Sheet.find({
      classCode,
      isPublished: true,
      isPersonal:  { $ne: true },
    }).sort('-createdAt');
    res.json(sheets);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ══════════════════════════════════════════════════════════════════
//  STUDENT PERSONAL SHEET ROUTES
// ══════════════════════════════════════════════════════════════════

// Create personal sheet
router.post('/personal', verifyToken, async (req, res) => {
  try {
    const sheet = await Sheet.create({
      ...req.body,
      createdBy:    req.user._id,
      studentOwner: req.user._id,
      isPersonal:   true,
      isPublished:  false,
      classCode:    '',
    });
    res.status(201).json(sheet);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get own personal sheets
router.get('/personal', verifyToken, async (req, res) => {
  try {
    const sheets = await Sheet.find({
      studentOwner: req.user._id,
      isPersonal:   true,
    }).sort('-createdAt');
    res.json(sheets);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update personal sheet
router.put('/personal/:id', verifyToken, async (req, res) => {
  try {
    const sheet = await Sheet.findOneAndUpdate(
      { _id: req.params.id, studentOwner: req.user._id, isPersonal: true },
      req.body, { new: true }
    );
    if (!sheet) return res.status(404).json({ message: 'Sheet not found' });
    res.json(sheet);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete personal sheet
router.delete('/personal/:id', verifyToken, async (req, res) => {
  try {
    await Sheet.findOneAndDelete({
      _id: req.params.id, studentOwner: req.user._id, isPersonal: true,
    });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ══════════════════════════════════════════════════════════════════
//  PROGRESS TOGGLE
// ══════════════════════════════════════════════════════════════════

router.post('/:sheetId/toggle/:problemIdx', verifyToken, async (req, res) => {
  try {
    const { sheetId, problemIdx } = req.params;
    const idx = Number(problemIdx);

    let progress = await Progress.findOne({ student: req.user._id });
    if (!progress) progress = await Progress.create({ student: req.user._id });

    let sp = progress.sheetProgress.find(
      (s) => s.sheet.toString() === sheetId
    );
    if (!sp) {
      progress.sheetProgress.push({ sheet: sheetId, completedProblems: [idx] });
    } else {
      const pos = sp.completedProblems.indexOf(idx);
      if (pos === -1) sp.completedProblems.push(idx);
      else sp.completedProblems.splice(pos, 1);
      sp.lastUpdated = new Date();
    }

    await progress.save();
    res.json({ sheetProgress: progress.sheetProgress });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/progress/me', verifyToken, async (req, res) => {
  try {
    const progress = await Progress.findOne({ student: req.user._id });
    res.json({ sheetProgress: progress?.sheetProgress ?? [] });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;