import express  from 'express';
import User     from '../models/User.js';
import Progress from '../models/Progress.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// ─── GET /api/students — enrolled + pending for this teacher ─────────────────
router.get('/', verifyToken, requireRole('teacher'), async (req, res) => {
  try {
    const teacher = await User.findById(req.user._id);

    // Enrolled students
    const enrolled = await User.find({
      classCode: teacher.myClassCode,
      role:      'student',
    }).select('name email avatar leetcodeUsername createdAt');

    // Pending = emails invited but not yet registered or not yet enrolled
    const enrolledEmails = enrolled.map((s) => s.email);
    const pending = teacher.invitedEmails.filter(
      (e) => !enrolledEmails.includes(e)
    );

    res.json({ enrolled, pending });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/students/invite — teacher invites student by email ─────────────
router.post('/invite', verifyToken, requireRole('teacher'), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const teacher    = await User.findById(req.user._id);
    const normalized = email.trim().toLowerCase();

    // Already invited?
    if (teacher.invitedEmails.includes(normalized)) {
      return res.status(400).json({ message: 'This student is already invited' });
    }

    // Check if student already registered
    const existingStudent = await User.findOne({
      email: normalized,
      role:  'student',
    });

    if (existingStudent) {
      // Already in another class?
      if (
        existingStudent.classCode &&
        existingStudent.classCode !== teacher.myClassCode
      ) {
        return res.status(400).json({
          message: 'This student is already enrolled in another class',
        });
      }

      // Directly enroll them
      existingStudent.classCode = teacher.myClassCode;
      await existingStudent.save();

      // Scaffold progress if missing
      const exists = await Progress.findOne({ student: existingStudent._id });
      if (!exists) await Progress.create({ student: existingStudent._id });

      return res.json({
        message:  `${existingStudent.name} enrolled immediately!`,
        enrolled: true,
        student:  {
          _id:              existingStudent._id,
          name:             existingStudent.name,
          email:            existingStudent.email,
          avatar:           existingStudent.avatar,
          leetcodeUsername: existingStudent.leetcodeUsername,
        },
      });
    }

    // Student not registered yet — add to pending
    teacher.invitedEmails.push(normalized);
    await teacher.save();

    res.json({
      message:  `Invitation saved. When ${normalized} registers, they'll be auto-enrolled.`,
      enrolled: false,
      pending:  normalized,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── DELETE /api/students/:studentId — teacher removes enrolled student ───────
router.delete('/:studentId', verifyToken, requireRole('teacher'), async (req, res) => {
  try {
    const teacher = await User.findById(req.user._id);
    const student = await User.findOne({
      _id:       req.params.studentId,
      classCode: teacher.myClassCode,
      role:      'student',
    });

    if (!student) return res.status(404).json({ message: 'Student not found in your class' });

    student.classCode = '';
    await student.save();
    res.json({ message: `${student.name} removed from class` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── DELETE /api/students/pending/:email — cancel pending invite ─────────────
router.delete('/pending/:email', verifyToken, requireRole('teacher'), async (req, res) => {
  try {
    const teacher    = await User.findById(req.user._id);
    const normalized = decodeURIComponent(req.params.email).toLowerCase();
    teacher.invitedEmails = teacher.invitedEmails.filter((e) => e !== normalized);
    await teacher.save();
    res.json({ message: 'Invitation cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;