import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { Attendance } from "../models/Attendance.js";
import { Certificate } from "../models/Certificate.js";
import { INSTITUTE_DETAILS } from "../constants.js";
import { getInstituteBranding } from "../utils/instituteSettings.js";

const A4_WIDTH = 842;
const A4_HEIGHT = 595;
const AUTHORIZED_BY_NAME = "Subodh Kumar Yadav";

const buildCertificateNumber = () => {
  const stamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `KMP-CERT-${stamp}-${random}`;
};

const toObjectId = (value) => new mongoose.Types.ObjectId(value);

const certificatePopulate = [
  { path: "student", select: "name email phone studentClass" },
  { path: "course", select: "title subject board className batchName" },
  { path: "issuedBy", select: "name role" },
  { path: "revokedBy", select: "name role" }
];

const getVerificationUrl = (certificateNumber) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  return `${clientUrl}/verify-certificate/${encodeURIComponent(certificateNumber)}`;
};

const buildVerificationMeta = async (certificateNumber) => {
  const verificationUrl = getVerificationUrl(certificateNumber);
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 220,
    color: {
      dark: "#0f172a",
      light: "#ffffff"
    }
  });

  return { verificationUrl, qrCodeDataUrl };
};

const getCertificateStatus = (plain) => {
  const now = new Date();
  if (plain.revokedAt) return "revoked";
  if (plain.expiresAt && new Date(plain.expiresAt) < now) return "expired";
  return "valid";
};

const dataUrlToBuffer = (dataUrl) => {
  if (!dataUrl || typeof dataUrl !== "string") {
    return null;
  }

  const match = dataUrl.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);
  if (!match) {
    return null;
  }

  return Buffer.from(match[1], "base64");
};

const serializeCertificate = async (certificateDoc) => {
  const plain = typeof certificateDoc.toObject === "function"
    ? certificateDoc.toObject({ virtuals: true })
    : { ...certificateDoc };
  const verification = await buildVerificationMeta(plain.certificateNumber);
  const branding = await getInstituteBranding();

  return {
    ...plain,
    ...verification,
    status: getCertificateStatus(plain),
    instituteName: branding.name || INSTITUTE_DETAILS.name,
    instituteAddress: branding.address || INSTITUTE_DETAILS.address,
    instituteContact: branding.contact || INSTITUTE_DETAILS.contact,
    instituteLogoDataUrl: branding.logoDataUrl || "",
    instituteSignatureDataUrl: branding.signatureDataUrl || "",
    updatedAt: plain.updatedAt || plain.issuedAt
  };
};

const drawSignature = (doc, x, y) => {
  doc.save();
  doc.lineWidth(2.6);
  doc.lineCap("round");
  doc.lineJoin("round");
  doc.strokeColor("#3d3540");

  doc.moveTo(x + 2, y + 32)
    .bezierCurveTo(x - 18, y + 26, x - 15, y + 2, x + 16, y - 6)
    .bezierCurveTo(x + 52, y - 15, x + 93, y - 4, x + 98, y + 15)
    .bezierCurveTo(x + 104, y + 36, x + 64, y + 34, x + 34, y + 32)
    .stroke();

  doc.moveTo(x + 34, y + 31).lineTo(x + 34, y + 5).stroke();
  doc.moveTo(x + 58, y + 31).lineTo(x + 58, y + 5).stroke();
  doc.moveTo(x + 59, y + 20)
    .bezierCurveTo(x + 70, y + 12, x + 75, y + 6, x + 82, y + 3)
    .stroke();

  doc.moveTo(x + 102, y + 31)
    .bezierCurveTo(x + 110, y + 20, x + 118, y + 18, x + 126, y + 22)
    .bezierCurveTo(x + 133, y + 26, x + 128, y + 33, x + 137, y + 32)
    .bezierCurveTo(x + 146, y + 31, x + 148, y + 22, x + 158, y + 22)
    .bezierCurveTo(x + 169, y + 22, x + 165, y + 33, x + 176, y + 33)
    .bezierCurveTo(x + 187, y + 33, x + 194, y + 26, x + 205, y + 27)
    .bezierCurveTo(x + 213, y + 28, x + 219, y + 32, x + 228, y + 32)
    .stroke();

  doc.lineWidth(2.2);
  doc.moveTo(x + 2, y + 34)
    .bezierCurveTo(x + 58, y + 33, x + 130, y + 33, x + 254, y + 34)
    .stroke();
  doc.moveTo(x + 248, y + 31).lineTo(x + 265, y + 35).lineTo(x + 249, y + 38).stroke();
  doc.restore();
};

const createCertificatePdfBuffer = async (certificateDoc) => {
  const certificate = await serializeCertificate(certificateDoc);
  const qrBase64 = certificate.qrCodeDataUrl.split(",")[1];
  const qrBuffer = Buffer.from(qrBase64, "base64");
  const logoBuffer = dataUrlToBuffer(certificate.instituteLogoDataUrl);
  const signatureBuffer = dataUrlToBuffer(certificate.instituteSignatureDataUrl);
  const issueDate = new Date(certificate.issuedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const expiryDate = certificate.expiresAt ? new Date(certificate.expiresAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "No expiry";

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.rect(0, 0, A4_WIDTH, A4_HEIGHT).fill("#fff7ed");
    doc.circle(120, 95, 90).fillOpacity(0.22).fill("#fb923c").fillOpacity(1);
    doc.circle(745, 100, 88).fillOpacity(0.18).fill("#34d399").fillOpacity(1);
    doc.roundedRect(24, 24, 794, 547, 24).fill("#ffffff");
    doc.roundedRect(38, 38, 766, 519, 22).lineWidth(3).strokeColor("#f97316").stroke();
    doc.roundedRect(62, 62, 718, 64, 18).fillOpacity(0.15).fill("#f59e0b").fillOpacity(1);

    if (logoBuffer) {
      doc.image(logoBuffer, 72, 70, { fit: [58, 58], align: "center", valign: "center" });
    } else {
      doc.save();
      doc.roundedRect(72, 70, 58, 58, 16).fill("#f97316");
      doc.fillColor("#ffffff").fontSize(16).font("Helvetica-Bold").text("KMP", 79, 91, { width: 44, align: "center" });
      doc.restore();
    }

    doc.save();
    doc.circle(730, 472, 36).fill("#0f172a");
    doc.circle(730, 472, 26).lineWidth(2).strokeColor("#f8fafc").stroke();
    doc.fillColor("#f59e0b").circle(730, 472, 17).fill();
    doc.restore();

    doc.fillColor("#9a3412").font("Times-Bold").fontSize(17).text(certificate.instituteName || INSTITUTE_DETAILS.name, 0, 88, { align: "center" });
    doc.fillColor("#0f172a").font("Times-Bold").fontSize(30).text("Course Completion Certificate", 0, 112, { align: "center" });
    doc.fillColor("#475569").font("Helvetica").fontSize(13).text("Awarded for strong attendance, dedication, and successful completion", 0, 145, { align: "center" });
    doc.fillColor("#64748b").font("Times-Roman").fontSize(17).text("This certifies that", 0, 220, { align: "center" });
    doc.fillColor("#111827").font("Times-Bold").fontSize(34).text(certificate.student?.name || "Student", 0, 252, { align: "center" });
    doc.fillColor("#334155").font("Helvetica").fontSize(18).text("has successfully completed", 0, 304, { align: "center" });
    doc.fillColor("#ea580c").font("Times-Bold").fontSize(24).text(certificate.course?.title || "Course", 0, 334, { align: "center" });
    doc.fillColor("#475569").font("Helvetica").fontSize(14).text(`Class ${certificate.course?.className || certificate.student?.studentClass || "-"} â€¢ ${certificate.course?.subject || "Mathematics"} â€¢ ${certificate.course?.board || "Bihar Board"}`, 0, 366, { align: "center" });

    doc.roundedRect(110, 412, 510, 70, 18).fillAndStroke("#fff7ed", "#fdba74");
    doc.fillColor("#9a3412").font("Helvetica-Bold").fontSize(11).text("Attendance", 145, 430);
    doc.fillColor("#111827").font("Helvetica-Bold").fontSize(18).text(`${certificate.attendancePercent}%`, 145, 448);
    doc.fillColor("#9a3412").font("Helvetica-Bold").fontSize(11).text("Certificate No.", 275, 430);
    doc.fillColor("#111827").font("Helvetica-Bold").fontSize(14).text(certificate.certificateNumber, 275, 448);
    doc.fillColor("#9a3412").font("Helvetica-Bold").fontSize(11).text("Issued", 470, 430);
    doc.fillColor("#111827").font("Helvetica-Bold").fontSize(14).text(issueDate, 470, 448);

    doc.image(qrBuffer, 635, 205, { width: 118, height: 118 });
    doc.fillColor("#475569").font("Helvetica-Bold").fontSize(10).text("Scan to verify", 628, 330, { width: 132, align: "center" });

    doc.fillColor("#64748b").font("Helvetica").fontSize(10).text(`Status: ${certificate.status.toUpperCase()}`, 110, 500);
    doc.text(`Valid Until: ${expiryDate}`, 250, 500);
    if (certificate.status === "revoked") {
      doc.fillColor("#b91c1c").font("Helvetica-Bold").fontSize(10).text(`Revoked: ${certificate.revocationReason || "Administrative action"}`, 430, 500);
    }

    doc.moveTo(110, 540).lineTo(270, 540).lineWidth(1.5).strokeColor("#94a3b8").stroke();
    if (signatureBuffer) {
      doc.image(signatureBuffer, 110, 495, { fit: [170, 50], align: "left", valign: "center" });
    } else {
      drawSignature(doc, 118, 508);
    }
    doc.fillColor("#475569").font("Helvetica").fontSize(12).text(`Authorized By: ${AUTHORIZED_BY_NAME}`, 110, 548);
    doc.moveTo(560, 540).lineTo(720, 540).lineWidth(1.5).strokeColor("#94a3b8").stroke();
    doc.fillColor("#475569").font("Helvetica").fontSize(12).text("Seal of Excellence", 560, 548);

    doc.end();
  });
};

const sendCertificatePdf = async (certificate, res) => {
  const pdfBuffer = await createCertificatePdfBuffer(certificate);
  const safeName = (certificate.student?.name || "student").replace(/\s+/g, "-").toLowerCase();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${safeName}-certificate.pdf"`);
  res.send(pdfBuffer);
};

const buildEligiblePipeline = ({ studentId, courseId } = {}) => {
  const matchStage = {};
  if (studentId) matchStage.student = toObjectId(studentId);
  if (courseId) matchStage.course = toObjectId(courseId);

  return [
    Object.keys(matchStage).length ? { $match: matchStage } : null,
    { $group: { _id: { student: "$student", course: "$course" }, totalSessions: { $sum: 1 }, presentSessions: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } } } },
    { $addFields: { attendancePercent: { $round: [{ $multiply: [{ $divide: ["$presentSessions", { $max: ["$totalSessions", 1] }] }, 100] }, 0] } } },
    { $match: { attendancePercent: { $gte: 75 } } },
    { $lookup: { from: "enrollments", let: { studentId: "$_id.student", courseId: "$_id.course" }, pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$student", "$$studentId"] }, { $eq: ["$course", "$$courseId"] }, { $eq: ["$status", "approved"] }] } } }], as: "enrollment" } },
    { $match: { "enrollment.0": { $exists: true } } },
    { $lookup: { from: "users", localField: "_id.student", foreignField: "_id", as: "student" } },
    { $unwind: "$student" },
    { $lookup: { from: "courses", localField: "_id.course", foreignField: "_id", as: "course" } },
    { $unwind: "$course" },
    { $lookup: { from: "certificates", let: { studentId: "$_id.student", courseId: "$_id.course" }, pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$student", "$$studentId"] }, { $eq: ["$course", "$$courseId"] }] } } }, { $lookup: { from: "users", localField: "issuedBy", foreignField: "_id", as: "issuedBy" } }, { $unwind: { path: "$issuedBy", preserveNullAndEmptyArrays: true } }, { $lookup: { from: "users", localField: "revokedBy", foreignField: "_id", as: "revokedBy" } }, { $unwind: { path: "$revokedBy", preserveNullAndEmptyArrays: true } }], as: "certificate" } },
    { $project: { _id: 0, student: { _id: "$student._id", name: "$student.name", email: "$student.email", phone: "$student.phone", studentClass: "$student.studentClass" }, course: { _id: "$course._id", title: "$course.title", subject: "$course.subject", board: "$course.board", className: "$course.className", batchName: "$course.batchName" }, totalSessions: 1, presentSessions: 1, attendancePercent: 1, certificate: { $arrayElemAt: ["$certificate", 0] } } },
    { $sort: { attendancePercent: -1, "student.name": 1 } }
  ].filter(Boolean);
};

export const getEligibleCertificates = async (_req, res) => {
  const eligible = await Attendance.aggregate(buildEligiblePipeline());
  const serialized = await Promise.all(eligible.map(async (item) => ({ ...item, certificate: item.certificate ? await serializeCertificate(item.certificate) : null })));
  res.json(serialized);
};

export const issueCertificate = async (req, res) => {
  const { studentId, courseId } = req.body;
  if (!studentId || !courseId) return res.status(400).json({ message: "Student and course are required" });

  const [eligibility] = await Attendance.aggregate(buildEligiblePipeline({ studentId, courseId }));
  if (!eligibility) return res.status(400).json({ message: "Student is not eligible for this certificate yet" });

  let certificate = await Certificate.findOne({ student: studentId, course: courseId }).populate(certificatePopulate);
  if (!certificate) {
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt);
    expiresAt.setFullYear(expiresAt.getFullYear() + 5);

    certificate = await Certificate.create({ certificateNumber: buildCertificateNumber(), student: studentId, course: courseId, attendancePercent: eligibility.attendancePercent, issuedBy: req.user._id, issuedAt, expiresAt });
    certificate = await Certificate.findById(certificate._id).populate(certificatePopulate);
  }

  res.status(201).json(await serializeCertificate(certificate));
};

export const updateCertificateStatus = async (req, res) => {
  const certificate = await Certificate.findById(req.params.id).populate(certificatePopulate);
  if (!certificate) return res.status(404).json({ message: "Certificate not found" });

  if (req.body.expiresAt === "") {
    certificate.expiresAt = null;
  } else if (req.body.expiresAt) {
    const nextExpiry = new Date(req.body.expiresAt);
    if (!Number.isNaN(nextExpiry.getTime())) {
      certificate.expiresAt = nextExpiry;
    }
  }

  const revoke = Boolean(req.body.revoke);
  if (revoke) {
    certificate.revokedAt = new Date();
    certificate.revokedBy = req.user._id;
    certificate.revocationReason = req.body.revocationReason?.trim() || "Administrative action";
  } else {
    certificate.revokedAt = null;
    certificate.revokedBy = null;
    certificate.revocationReason = "";
  }

  await certificate.save();
  await certificate.populate(certificatePopulate);
  res.json(await serializeCertificate(certificate));
};

export const getMyCertificates = async (req, res) => {
  const certificates = await Certificate.find({ student: req.user._id }).populate(certificatePopulate).sort({ issuedAt: -1 });
  res.json(await Promise.all(certificates.map(serializeCertificate)));
};

export const getIssuedCertificates = async (_req, res) => {
  const certificates = await Certificate.find().populate(certificatePopulate).sort({ issuedAt: -1, createdAt: -1 });
  res.json(await Promise.all(certificates.map(serializeCertificate)));
};

export const verifyCertificate = async (req, res) => {
  const certificate = await Certificate.findOne({ certificateNumber: req.params.certificateNumber }).populate(certificatePopulate);
  if (!certificate) return res.status(404).json({ message: "Certificate not found" });
  res.json(await serializeCertificate(certificate));
};

export const downloadPublicCertificatePdf = async (req, res) => {
  const certificate = await Certificate.findOne({ certificateNumber: req.params.certificateNumber }).populate(certificatePopulate);
  if (!certificate) return res.status(404).json({ message: "Certificate not found" });
  await sendCertificatePdf(certificate, res);
};

export const downloadCertificatePdf = async (req, res) => {
  const certificate = await Certificate.findById(req.params.id).populate(certificatePopulate);
  if (!certificate) return res.status(404).json({ message: "Certificate not found" });

  const isAdmin = req.user.role === "admin";
  const isOwner = certificate.student?._id?.toString() === req.user._id.toString();
  if (!isAdmin && !isOwner) return res.status(403).json({ message: "Forbidden" });

  await sendCertificatePdf(certificate, res);
};
