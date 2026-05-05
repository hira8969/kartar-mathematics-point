import mongoose from "mongoose";
import { INSTITUTE_DETAILS } from "../constants.js";

const instituteSettingsSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: INSTITUTE_DETAILS.name },
    address: { type: String, trim: true, default: INSTITUTE_DETAILS.address },
    contact: { type: String, trim: true, default: INSTITUTE_DETAILS.contact },
    logoDataUrl: { type: String, default: "" },
    signatureDataUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

export const InstituteSettings = mongoose.model("InstituteSettings", instituteSettingsSchema);
