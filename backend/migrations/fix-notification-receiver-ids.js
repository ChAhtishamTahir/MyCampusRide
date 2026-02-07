const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const Notification = require('../models/Notification');
const User = require('../models/User');

async function migrateNotifications() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bus-tracking';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const brokenNotifications = await Notification.find({
      senderRole: 'system',
      receiverRole: 'driver',
      receiverId: null,
      $or: [
        { title: 'Account Approved' },
        { title: 'Account Rejected' }
      ]
    });

    console.log(`Found ${brokenNotifications.length} notifications to fix`);

    let fixed = 0;
    let skipped = 0;

    for (const notification of brokenNotifications) {
      let driverId = null;

      if (notification.relatedEntity && notification.relatedEntity.type === 'user') {
        driverId = notification.relatedEntity.id;
      }

      if (!driverId && notification.metadata && notification.metadata.userId) {
        driverId = notification.metadata.userId;
      }

      if (!driverId && notification.metadata && notification.metadata.driverId) {
        driverId = notification.metadata.driverId;
      }

      if (driverId) {
        const driver = await User.findById(driverId);
        if (driver) {
          await Notification.findByIdAndUpdate(notification._id, {
            receiverId: driverId
          });
          console.log(`Fixed notification ${notification._id} -> receiverId: ${driverId}`);
          fixed++;
        } else {
          console.log(`Skipped notification ${notification._id}: Driver ${driverId} not found`);
          skipped++;
        }
      } else {
        console.log(`Skipped notification ${notification._id}: No driver ID found in metadata`);
        skipped++;
      }
    }

    console.log(`\nMigration complete:`);
    console.log(`- Fixed: ${fixed}`);
    console.log(`- Skipped: ${skipped}`);
    console.log(`- Total processed: ${brokenNotifications.length}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateNotifications();
