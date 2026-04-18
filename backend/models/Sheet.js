import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  url:         { type: String, required: true },
  difficulty:  { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  topic:       { type: String, required: true }, // e.g., "Arrays", "DP"
  leetcodeId:  { type: String, default: '' },    // slug from leetcode
  isCustom:    { type: Boolean, default: false }, // teacher-defined problem
  notes:       { type: String, default: '' },
});

const sheetSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    description: { type: String, default: '' },
    problems:    [problemSchema],
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    classCode:   { type: String, required: true }, // teacher's class code this sheet belongs to
    dueDate:     { type: Date },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Sheet', sheetSchema);