import 'dotenv/config';

const missing = ['MONGODB_URI', 'JWT_SECRET'].filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`\nMissing environment variables: ${missing.join(', ')}`);
  console.error('Copy backend/.env.example to backend/.env and fill in the values.\n');
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
  console.error('\nJWT_SECRET must be at least 32 characters long.\n');
  process.exit(1);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5001,
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim()),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  adminEmail: process.env.ADMIN_EMAIL || 'admin@framespace.app',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin1234',
};
