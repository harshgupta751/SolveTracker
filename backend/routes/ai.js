// This proxy prevents exposing your key on the frontend (production use)
import express from 'express';
import axios from 'axios';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/insight', verifyToken, async (req, res) => {
  try {
    const { messages, max_tokens = 1000 } = req.body;
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      { model: 'claude-sonnet-4-20250514', max_tokens, messages },
      {
        headers: {
          'x-api-key':         process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type':      'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    res.status(502).json({ message: err.response?.data?.error?.message || 'AI request failed' });
  }
});

export default router;