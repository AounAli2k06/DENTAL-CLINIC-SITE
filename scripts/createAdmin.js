/**
 * Seeds (or updates) the first admin user.
 * Usage: npm run create-admin
 * Reads ADMIN_EMAIL / ADMIN_PASSWORD / MONGODB_URI from .env.local
 */
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function main() {
  const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error(
      'Missing MONGODB_URI, ADMIN_EMAIL, or ADMIN_PASSWORD in .env.local'
    );
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);

  const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin'], default: 'admin' },
  });

  const User = mongoose.models.User || mongoose.model('User', UserSchema);

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    existing.password = hashedPassword;
    await existing.save();
    console.log(`Updated password for existing admin: ${ADMIN_EMAIL}`);
  } else {
    await User.create({
      email: ADMIN_EMAIL.toLowerCase(),
      password: hashedPassword,
      role: 'admin',
    });
    console.log(`Created admin user: ${ADMIN_EMAIL}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
