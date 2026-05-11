import 'dotenv/config';
import express        from 'express';
import cors           from 'cors';
import mongoose       from 'mongoose';
import { globalLimiter, authLimiter, aiLimiter } from './middleware/rate-limiter.js'; 

import authRoutes      from './routes/auth.js';
import leetcodeRoutes  from './routes/leetcode.js';
import sheetRoutes     from './routes/sheets.js';
import analyticsRoutes from './routes/analytics.js';
import aiRoutes        from './routes/ai.js';
import studentRoutes   from './routes/students.js';   // ← NEW

const app = express();

app.set('trust proxy', 1);

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(globalLimiter)
app.use(express.json({ limit: '10mb' }));


app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/leetcode',  leetcodeRoutes);
app.use('/api/sheets',    sheetRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api/students',  studentRoutes);              // ← NEW

app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', ts: new Date().toISOString() })
);

app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('✅  MongoDB connected');
  app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
}).catch((err) => { console.error('❌  DB failed:', err.message); process.exit(1); });