import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI is not defined in your .env file');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB database.');

    const adminEmail = process.argv[2] || 'samsanjeevan587@gmail.com';
    const adminPassword = process.argv[3] || 'Admin@123';
    const adminName = 'System Administrator';

    if (adminPassword.length < 6) {
      console.error('❌ Password must be at least 6 characters long.');
      process.exit(1);
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: adminEmail.toLowerCase() });

    if (userExists) {
      const wasAdmin = userExists.isAdmin;
      userExists.isAdmin = true;
      userExists.password = adminPassword; // hashed in user pre-save hook
      await userExists.save();
      if (wasAdmin) {
        console.log(`✅ Admin user "${adminEmail}" updated with the specified password.`);
      } else {
        console.log(`✅ Existing user "${adminEmail}" upgraded to Admin with the specified password!`);
      }
    } else {
      // Create new Admin
      const newAdmin = new User({
        name: adminName,
        email: adminEmail.toLowerCase(),
        password: adminPassword,
        isAdmin: true,
      });

      await newAdmin.save();
      console.log(`✅ Admin user created successfully!`);
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Password: ${adminPassword}`);
    }

    await mongoose.disconnect();
    console.log('ℹ️ Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error creating admin user: ${error.message}`);
    process.exit(1);
  }
};

createAdmin();
