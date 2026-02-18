require("dotenv").config();
const mongoose = require("mongoose");
const config = require("./config");
const User = require("./models/User");
const EventType = require("./models/EventType");

async function seed() {
  try {
    await mongoose.connect(config.db.uri);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await EventType.deleteMany({});
    console.log("Cleared existing data");

    // Create HR Accounts
    const hr1 = await User.create({
      username: "hr_acme",
      password: "password123",
      role: "hr",
      companyName: "Acme Corporation",
    });

    const hr2 = await User.create({
      username: "hr_globex",
      password: "password123",
      role: "hr",
      companyName: "Globex Industries",
    });

    console.log("Created HR accounts");

    // Create Vendor Accounts
    const vendor1 = await User.create({
      username: "vendor_healthplus",
      password: "password123",
      role: "vendor",
      companyName: "HealthPlus Pte Ltd",
    });

    const vendor2 = await User.create({
      username: "vendor_wellcare",
      password: "password123",
      role: "vendor",
      companyName: "WellCare Solutions",
    });

    const vendor3 = await User.create({
      username: "vendor_fitlife",
      password: "password123",
      role: "vendor",
      companyName: "FitLife Wellness",
    });

    console.log("Created Vendor accounts");

    // Create Event Types (each tagged to a vendor)
    await EventType.create([
      {
        name: "Health Talk - Stress Management",
        description: "A talk on managing workplace stress and mental wellness",
        vendor: vendor1._id,
      },
      {
        name: "Health Talk - Nutrition",
        description: "A talk on healthy eating habits and nutrition",
        vendor: vendor1._id,
      },
      {
        name: "Onsite Health Screening",
        description:
          "Basic health screening including BMI, blood pressure, blood glucose",
        vendor: vendor2._id,
      },
      {
        name: "Onsite Eye Screening",
        description: "Eye health check and vision screening",
        vendor: vendor2._id,
      },
      {
        name: "Fitness Workshop - Yoga",
        description: "Guided yoga session for employees",
        vendor: vendor3._id,
      },
      {
        name: "Fitness Workshop - HIIT",
        description: "High-intensity interval training session",
        vendor: vendor3._id,
      },
    ]);

    console.log("Created Event Types");

    // Print login credentials
    console.log("\n================================");
    console.log("  PRE-CREATED ACCOUNTS");
    console.log("================================");
    console.log("\n  HR Accounts:");
    console.log("  hr_acme       / password123  (Acme Corporation)");
    console.log("  hr_globex     / password123  (Globex Industries)");
    console.log("\n  Vendor Accounts:");
    console.log("  vendor_healthplus / password123  (HealthPlus Pte Ltd)");
    console.log("  vendor_wellcare   / password123  (WellCare Solutions)");
    console.log("  vendor_fitlife    / password123  (FitLife Wellness)");
    console.log("================================\n");

    await mongoose.disconnect();
    console.log("Seed completed!");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

seed();
