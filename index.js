import 'dotenv/config';
import mongoose from 'mongoose';
import { createApp } from './src/app.js';

const port = process.env.PORT || 3000;
const uri = process.env.MONGO_URI;

if (!uri || !process.env.JWT_SECRET || !process.env.FINGERPRINT_SECRET) {
  console.error('Set MONGO_URI, JWT_SECRET and FINGERPRINT_SECRET (see .env.example).');
  process.exit(1);
}

await mongoose.connect(uri);
createApp().listen(port, () => console.log(`Saraha API listening on port ${port}`));
