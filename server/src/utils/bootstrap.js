import { User } from "../models/User.js";
import { ROLES } from "../constants.js";

export const ensureSuperAdmin = async () => {
  const adminEmail = (process.env.SUPER_ADMIN_EMAIL || "admin@kmp.edu.in").toLowerCase();
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || "Admin@123";

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    return existingAdmin;
  }

  const admin = await User.create({
    name: "Super Admin",
    email: adminEmail,
    phone: "9000000000",
    password: adminPassword,
    role: ROLES.ADMIN,
    isApproved: true,
    isSuspended: false
  });

  console.log(`Super admin created: ${adminEmail}`);
  return admin;
};
