import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9._]{3,20}$/ },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    bio: { type: String, default: '', maxlength: 160 },
    profileImage: { type: String, default: '' },
    profileImageId: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model('User', userSchema);
