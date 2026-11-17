import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    photoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Photo', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// One bookmark per user per photograph.
bookmarkSchema.index({ userId: 1, photoId: 1 }, { unique: true });
bookmarkSchema.index({ photoId: 1 });

export default mongoose.model('Bookmark', bookmarkSchema);
