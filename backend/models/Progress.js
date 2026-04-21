import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  title:     String,
  titleSlug: String,
  timestamp: Number,
  status:    String, // "Accepted", "Wrong Answer", etc.
  lang:      String,
});

const progressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    // Cached LeetCode stats (refreshed on sync)
    leetcode: {
      totalSolved:    { type: Number, default: 0 },
      easySolved:     { type: Number, default: 0 },
      mediumSolved:   { type: Number, default: 0 },
      hardSolved:     { type: Number, default: 0 },
      totalSubmissions: { type: Number, default: 0 },
      acceptanceRate: { type: Number, default: 0 },
      ranking:        { type: Number, default: 0 },
      // Topic-wise solved map: { "Arrays": 12, "DP": 5, ... }
      topicStats:     { type: Map, of: Number, default: {} },
      recentSubmissions: { type: [submissionSchema], default: [] },
      lastSynced:     { type: Date },
    },

    // Per-sheet completion tracking
    sheetProgress: [
      {
        sheet:            { type: mongoose.Schema.Types.ObjectId, ref: 'Sheet' },
        completedProblems: [{ type: Number }], // array of problem indices
        verifiedProblems:  [{ type: Number }],
        lastUpdated:      { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Progress', progressSchema);