import { INSTITUTE_DETAILS } from "../constants.js";
import { InstituteSettings } from "../models/InstituteSettings.js";

const DEFAULT_SETTINGS = {
  name: INSTITUTE_DETAILS.name,
  address: INSTITUTE_DETAILS.address,
  contact: INSTITUTE_DETAILS.contact,
  logoDataUrl: "",
  signatureDataUrl: ""
};

const isImageDataUrl = (value) => !value || /^data:image\/.+/i.test(value);

export const getInstituteSettingsRecord = async () => {
  let settings = await InstituteSettings.findOne();
  if (!settings) {
    settings = await InstituteSettings.create(DEFAULT_SETTINGS);
  }
  return settings;
};

export const serializeInstituteSettings = (settings) => ({
  _id: settings._id,
  name: settings.name || DEFAULT_SETTINGS.name,
  address: settings.address || DEFAULT_SETTINGS.address,
  contact: settings.contact || DEFAULT_SETTINGS.contact,
  logoDataUrl: settings.logoDataUrl || "",
  signatureDataUrl: settings.signatureDataUrl || "",
  createdAt: settings.createdAt,
  updatedAt: settings.updatedAt
});

export const getInstituteBranding = async () => serializeInstituteSettings(await getInstituteSettingsRecord());

export const applyInstituteSettingsUpdate = async (payload = {}) => {
  const settings = await getInstituteSettingsRecord();

  if (payload.name !== undefined) {
    settings.name = payload.name?.trim() || DEFAULT_SETTINGS.name;
  }

  if (payload.address !== undefined) {
    settings.address = payload.address?.trim() || DEFAULT_SETTINGS.address;
  }

  if (payload.contact !== undefined) {
    settings.contact = payload.contact?.trim() || DEFAULT_SETTINGS.contact;
  }

  if (payload.logoDataUrl !== undefined) {
    if (!isImageDataUrl(payload.logoDataUrl)) {
      throw new Error("Logo must be a valid image file");
    }
    settings.logoDataUrl = payload.logoDataUrl || "";
  }

  if (payload.signatureDataUrl !== undefined) {
    if (!isImageDataUrl(payload.signatureDataUrl)) {
      throw new Error("Signature must be a valid image file");
    }
    settings.signatureDataUrl = payload.signatureDataUrl || "";
  }

  await settings.save();
  return serializeInstituteSettings(settings);
};
