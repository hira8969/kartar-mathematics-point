import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES, INSTITUTE_DETAILS } from "../constants.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    phone: { type: String, trim: true, unique: true, sparse: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.STUDENT },
    studentClass: { type: String, default: "" },
    subjectsTaught: { type: [String], default: [] },
    instituteAddress: { type: String, default: INSTITUTE_DETAILS.address },
    instituteContact: { type: String, default: INSTITUTE_DETAILS.contact },
    isApproved: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false }
  },
  { timestamps: true }
);

userSchema.pre("save", async function savePassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model("User", userSchema);
