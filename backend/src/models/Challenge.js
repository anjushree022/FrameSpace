import mongoose from 'mongoose';
import { CHALLENGE_STATUSES } from '../utils/constants.js';

const challengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, required: true, trim: true, maxlength: 600 },
    theme: { type: String, required: true, trim: true, maxlength: 40 },
    startDate: { type: Date, required: true },
    deadline: { type: Date, required: true },
    status: { type: String, enum: CHALLENGE_STATUSES, default: 'upcoming' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model('Challenge', challengeSchema);
