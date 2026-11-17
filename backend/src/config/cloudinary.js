import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

const { cloudName, apiKey, apiSecret } = env.cloudinary;
export const cloudinaryEnabled = Boolean(cloudName && apiKey && apiSecret);

if (cloudinaryEnabled) {
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
} else {
  console.warn('Cloudinary is not configured: uploads are disabled until CLOUDINARY_* is set in .env.');
}

export function uploadBuffer(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ resource_type: 'image', ...options }, (err, result) =>
      err ? reject(err) : resolve(result)
    );
    stream.end(buffer);
  });
}

export function uploadDataUri(uri, options) {
  return cloudinary.uploader.upload(uri, { resource_type: 'image', ...options });
}

export async function destroyImage(publicId) {
  if (!cloudinaryEnabled || !publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Could not delete Cloudinary asset', publicId, err.message);
  }
}
