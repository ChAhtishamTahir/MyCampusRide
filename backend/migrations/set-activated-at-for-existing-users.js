const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const setActivatedAtForExistingUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const activeUsers = await User.find({
      status: 'active',
      activatedAt: { $exists: false }
    });

    console.log(`Found ${activeUsers.length} active users without activatedAt field`);

    for (const user of activeUsers) {
      user.activatedAt = user.createdAt || new Date();
      await user.save();
      console.log(`Set activatedAt for user: ${user.email}`);
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

setActivatedAtForExistingUsers();
