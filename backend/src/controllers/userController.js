import User from '../models/User.js';
import Photo from '../models/Photo.js';
import { cloudinaryEnabled, destroyImage, uploadDataUri } from '../config/cloudinary.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { parse, profileSchema } from '../utils/schemas.js';
import { decoratePhotos, publicUser, selfUser } from '../utils/serialize.js';

const findByUsername = async (username) => {
  const user = await User.findOne({ username: String(username).toLowerCase() });
  if (!user) throw new ApiError(404, 'We could not find that photographer.');
  return user;
};

export const getProfile = asyncHandler(async (req, res) => {
  const user = await findByUsername(req.params.username);
  const [totals] = await Photo.aggregate([
    { $match: { userId: user._id } },
    { $group: { _id: null, photoCount: { $sum: 1 }, likesReceived: { $sum: '$likeCount' } } },
  ]);
  res.json({
    user: publicUser(user),
    stats: { photoCount: totals?.photoCount ?? 0, likesReceived: totals?.likesReceived ?? 0 },
  });
});

export const getUserPhotos = asyncHandler(async (req, res) => {
  const user = await findByUsername(req.params.username);
  const items = await Photo.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
  res.json({ photos: await decoratePhotos(items, req.user?._id) });
});

const DATA_URI = /^data:image\/(jpeg|png|webp);base64,/;

export const updateMe = asyncHandler(async (req, res) => {
  const data = parse(profileSchema, req.body);
  const user = req.user;

  if (data.username !== user.username && (await User.exists({ username: data.username, _id: { $ne: user._id } }))) {
    throw new ApiError(422, 'Please fix the highlighted fields.', { username: 'That username is taken.' });
  }

  const { profileImage } = data;
  if (profileImage !== undefined) {
    if (profileImage.startsWith('data:')) {
      if (!DATA_URI.test(profileImage) || profileImage.length > 1_500_000) {
        throw new ApiError(422, 'Please fix the highlighted fields.', { image: 'Use a JPEG, PNG or WebP image under 1 MB.' });
      }
      if (!cloudinaryEnabled) throw new ApiError(503, 'Image storage is not configured on the server yet.');
      const uploaded = await uploadDataUri(profileImage, {
        folder: 'framespace/avatars',
        transformation: [{ width: 256, height: 256, crop: 'fill', gravity: 'face' }],
      });
      const previous = user.profileImageId;
      user.profileImage = uploaded.secure_url;
      user.profileImageId = uploaded.public_id;
      await destroyImage(previous);
    } else if (profileImage === '') {
      await destroyImage(user.profileImageId);
      user.profileImage = '';
      user.profileImageId = '';
    }
    // any other value is the existing URL coming back unchanged
  }

  user.name = data.name;
  user.username = data.username;
  user.bio = data.bio;
  await user.save();
  res.json({ user: selfUser(user) });
});
