import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    photoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Photo', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// One like per user per photograph.
likeSchema.index({ userId: 1, photoId: 1 }, { unique: true });
likeSchema.index({ photoId: 1 });

export default mongoose.model('Like', likeSchema);
