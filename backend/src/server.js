import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import app from './app.js';

try {
  await connectDb();
} catch (err) {
  console.error('\nCould not connect to MongoDB:', err.message);
  console.error('Check MONGODB_URI in backend/.env and that your IP address is allowed in Atlas Network Access.\n');
  process.exit(1);
}

app.listen(env.port, () => console.log(`FrameSpace API running on http://localhost:${env.port}`));
