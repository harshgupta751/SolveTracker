import mongoose from 'mongoose';
import bcrypt   from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    googleId: { type: String, sparse: true },
    avatar:   { type: String, default: '' },
    role:     { type: String, enum: ['student', 'teacher'], default: 'student' },

    // Student fields
    leetcodeUsername: { type: String, default: '' },
    classCode:        { type: String, default: '' },

    // Teacher fields
    myClassCode:   { type: String, default: '' },
    invitedEmails: { type: [String], default: [] }, // ← NEW: emails teacher invited
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);