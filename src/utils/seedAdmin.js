const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const Admin = require("../models/admin");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/codesfortomorrow";

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("--------MongoDB connected-------------");

    const email = "admin@codesfortomorrow.com";
    const password = "Admin123!@#";

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log("Admin already exists. Skipping seed.");
      await mongoose.disconnect();
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      email,
      password: hashedPassword,
    });

    await admin.save();
    console.log("Admin seeded successfully:");
    console.log({
      email,
      password,
    });

    await mongoose.disconnect();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error seeding admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();