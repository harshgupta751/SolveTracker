import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import { signToken, verifyToken } from '../middleware/auth.js';
import { nanoid } from 'nanoid'; // npm i nanoid

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Helper: build safe user payload ─────────────────────────────────────────
const userPayload = (user) => ({
  _id:     user._id,
  name:    user.name,
  email:   user.email,
  avatar:  user.avatar,
  role:    user.role,
  leetcodeUsername: user.leetcodeUsername,
  classCode:   user.classCode,
  myClassCode: user.myClassCode,
});

// ─── Register ─────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already in use' });

    const userData = { name, email, password, role };
    if (role === 'teacher') userData.myClassCode = nanoid(8).toUpperCase();

    const user = await User.create(userData);
    await Progress.create({ student: user._id }); // scaffold progress doc

    const token = signToken(user._id);
    res.status(201).json({ token, user: userPayload(user) });
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

// ─── Google OAuth (ID-token flow) ────────────────────────────────────────────
router.post('/google', async (req, res) => {
  try {
    const { credential, role } = req.body; // credential = Google ID token from frontend
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub: googleId, email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (!user) {
      const userData = { googleId, email, name, avatar: picture, role: role || 'student' };
      if (userData.role === 'teacher') userData.myClassCode = nanoid(8).toUpperCase();
      user = await User.create(userData);
      await Progress.create({ student: user._id });
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.avatar = picture;
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

// ─── Update profile (set leetcodeUsername, join class) ───────────────────────
router.patch('/profile', verifyToken, async (req, res) => {
  try {
    const { leetcodeUsername, classCode } = req.body;
    const updates = {};
    if (leetcodeUsername) updates.leetcodeUsername = leetcodeUsername.trim();
    if (classCode && req.user.role === 'student') updates.classCode = classCode.toUpperCase();

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ user: userPayload(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;