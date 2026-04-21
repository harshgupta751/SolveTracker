import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  url:        { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  topic:      { type: String, required: true },
  leetcodeId: { type: String, default: '' },
  isCustom:   { type: Boolean, default: false },
  notes:      { type: String, default: '' },
});

const sheetSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    description: { type: String, default: '' },
    problems:    [problemSchema],
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Teacher sheets
    classCode:   { type: String, default: '' },
    isPublished: { type: Boolean, default: false },
    dueDate:     { type: Date },

    // Student personal sheets ← NEW
    isPersonal:    { type: Boolean, default: false },
    studentOwner:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Sheet', sheetSchema);