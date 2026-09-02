import { User } from "../models/User.js";
import { ROLES } from "../constants.js";

const getSuperAdminEmails = () => {
  const emailList = process.env.SUPER_ADMIN_EMAILS || process.env.SUPER_ADMIN_EMAIL || "admin@kmp.edu.in";

  return Array.from(new Set(
    emailList
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  ));
};

export const ensureSuperAdmin = async () => {
  const adminEmails = getSuperAdminEmails();
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || "Admin@123";
  const admins = [];

  for (const adminEmail of adminEmails) {
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      existingAdmin.name = existingAdmin.name || "Super Admin";
      existingAdmin.role = ROLES.ADMIN;
      existingAdmin.isApproved = true;
      existingAdmin.isSuspended = false;
      if (!(await existingAdmin.comparePassword(adminPassword))) {
        existingAdmin.password = adminPassword;
      }
      await existingAdmin.save();
      admins.push(existingAdmin);
      continue;
    }

    const admin = await User.create({
      name: "Super Admin",
      email: adminEmail,
      password: adminPassword,
      role: ROLES.ADMIN,
      isApproved: true,
      isSuspended: false
    });

    console.log(`Super admin created: ${adminEmail}`);
    admins.push(admin);
  }

  return admins;
};
