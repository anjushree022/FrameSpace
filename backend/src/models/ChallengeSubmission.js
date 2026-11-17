import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  photoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Photo', required: true },
  submittedAt: { type: Date, default: Date.now },
});

// One submission per user per challenge.
submissionSchema.index({ challengeId: 1, userId: 1 }, { unique: true });
submissionSchema.index({ photoId: 1 });

export default mongoose.model('ChallengeSubmission', submissionSchema);
