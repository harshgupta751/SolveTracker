import express             from 'express';
import { OAuth2Client }    from 'google-auth-library';
import { nanoid }          from 'nanoid';
import User                from '../models/User.js';
import Progress            from '../models/Progress.js';
import { signToken, verifyToken } from '../middleware/auth.js';

const router     = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const userPayload = (user) => ({
  _id:              user._id,
  name:             user.name,
  email:            user.email,
  avatar:           user.avatar,
  role:             user.role,
  leetcodeUsername: user.leetcodeUsername,
  classCode:        user.classCode,
  myClassCode:      user.myClassCode,
});

// ─── Helper: auto-enroll if teacher invited this email ────────────────────────
async function checkAndEnroll(email, userId) {
  const teacher = await User.findOne({
    role:          'teacher',
    invitedEmails: email,
  });
  if (teacher) {
    await User.findByIdAndUpdate(userId, { classCode: teacher.myClassCode });
    // Remove from pending list
    teacher.invitedEmails = teacher.invitedEmails.filter((e) => e !== email);
    await teacher.save();
  }
}

// ─── Register ─────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already in use' });

    const userData = { name, email, password, role };
    if (role === 'teacher') userData.myClassCode = nanoid(8).toUpperCase();

    const user = await User.create(userData);
    await Progress.create({ student: user._id });

    // Auto-enroll if a teacher invited this email
    if (role === 'student') await checkAndEnroll(email, user._id);

    // Re-fetch to get updated classCode
    const freshUser = await User.findById(user._id);
    const token     = signToken(freshUser._id);
    res.status(201).json({ token, user: userPayload(freshUser) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Login ────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user._id);
    res.json({ token, user: userPayload(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Google OAuth ─────────────────────────────────────────────────────────────
router.post('/google', async (req, res) => {
  try {
    const { credential, role } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken:  credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub: googleId, email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (!user) {
      const userData = { googleId, email, name, avatar: picture, role: role || 'student' };
      if (userData.role === 'teacher') userData.myClassCode = nanoid(8).toUpperCase();
      user = await User.create(userData);
      await Progress.create({ student: user._id });
      if (userData.role === 'student') await checkAndEnroll(email, user._id);
      user = await User.findById(user._id);
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.avatar   = picture;
      await user.save();
    }

    const token = signToken(user._id);
    res.json({ token, user: userPayload(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get current user ─────────────────────────────────────────────────────────
router.get('/me', verifyToken, (req, res) => {
  res.json({ user: userPayload(req.user) });
});

// ─── Update profile ───────────────────────────────────────────────────────────
router.patch('/profile', verifyToken, async (req, res) => {
  try {
    const { leetcodeUsername } = req.body;
    const updates = {};
    if (leetcodeUsername) updates.leetcodeUsername = leetcodeUsername.trim();
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ user: userPayload(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;