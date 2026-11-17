import mongoose from 'mongoose';
import { CATEGORIES } from '../utils/constants.js';

const photoSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, default: '' }, // Cloudinary id, used when deleting
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    caption: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: '', trim: true, maxlength: 500 },
    category: { type: String, required: true, enum: CATEGORIES, index: true },
    tags: { type: [String], default: [] },
    likeCount: { type: Number, default: 0, min: 0 }, // kept in sync with the Likes collection
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

photoSchema.index({ createdAt: -1 });
photoSchema.index({ likeCount: -1, createdAt: -1 });

export default mongoose.model('Photo', photoSchema);
