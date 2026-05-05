import express from "express";
import {
  downloadCertificatePdf,
  downloadPublicCertificatePdf,
  getEligibleCertificates,
  getIssuedCertificates,
  getMyCertificates,
  issueCertificate,
  updateCertificateStatus,
  verifyCertificate
} from "../controllers/certificateController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/verify/:certificateNumber/pdf", downloadPublicCertificatePdf);
router.get("/verify/:certificateNumber", verifyCertificate);
router.get("/eligible", protect, authorize("admin"), getEligibleCertificates);
router.get("/issued", protect, authorize("admin"), getIssuedCertificates);
router.get("/:id/pdf", protect, downloadCertificatePdf);
router.patch("/:id/status", protect, authorize("admin"), updateCertificateStatus);
router.post("/issue", protect, authorize("admin"), issueCertificate);
router.get("/me", protect, authorize("student"), getMyCertificates);

export default router;
