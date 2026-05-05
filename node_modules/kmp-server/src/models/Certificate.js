import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    certificateNumber: { type: String, required: true, unique: true, trim: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    attendancePercent: { type: Number, required: true },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    issuedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
    revokedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    revocationReason: { type: String, default: "" }
  },
  { timestamps: true }
);

certificateSchema.index({ student: 1, course: 1 }, { unique: true });

export const Certificate = mongoose.model("Certificate", certificateSchema);
