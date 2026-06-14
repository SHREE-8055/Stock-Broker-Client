/**
 * Run once to create demo accounts:
 *   alice@demo.com / alice123
 *   bob@demo.com   / bob123
 *
 * Usage:  node src/scripts/seedUsers.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User     = require('../models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const demos = [
    { name: 'Alice', email: 'alice@demo.com', password: 'alice123' },
    { name: 'Bob',   email: 'bob@demo.com',   password: 'bob123'   },
  ];

  for (const d of demos) {
    const existing = await User.findOne({ email: d.email });
    if (existing) {
      // Update password so it matches even if already created without one
      existing.password = d.password;
      existing.name     = d.name;
      await existing.save();
      console.log(`✅  Updated: ${d.email}`);
    } else {
      await User.create(d);
      console.log(`✅  Created: ${d.email}`);
    }
  }

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch((e) => { console.error(e); process.exit(1); });
