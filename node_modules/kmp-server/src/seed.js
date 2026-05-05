import dotenv from "dotenv";
import { connectDb } from "./config/db.js";
import { User } from "./models/User.js";
import { Course } from "./models/Course.js";
import { ROLES } from "./constants.js";

dotenv.config();

const seed = async () => {
  await connectDb();

  const adminEmail = process.env.SUPER_ADMIN_EMAIL || "admin@kmp.edu.in";
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || "Admin@123";

  const existing = await User.findOne({ email: adminEmail });
  if (!existing) {
    await User.create({
      name: "Super Admin",
      email: adminEmail,
      phone: "9000000000",
      password: adminPassword,
      role: ROLES.ADMIN
    });
  }

  const courseCount = await Course.countDocuments();
  if (courseCount === 0) {
    await Course.insertMany([
      {
        title: "Class 10 Mathematics",
        className: "10",
        batchName: "Morning Batch",
        syllabus: "Algebra, Geometry, Trigonometry, Mensuration",
        fee: 1500
      },
      {
        title: "Class 12 Mathematics",
        className: "12",
        batchName: "Evening Batch",
        syllabus: "Calculus, Vectors, Probability, Linear Programming",
        fee: 2200
      }
    ]);
  }

  console.log("Seed completed");
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
