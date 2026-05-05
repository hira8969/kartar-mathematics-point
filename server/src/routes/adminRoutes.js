import express from "express";
import {
  bulkApproveUsers,
  bulkDeleteUsers,
  createUser,
  deleteUser,
  getAdminOverview,
  getInstituteSettings,
  getReports,
  getUsers,
  updateInstituteSettings,
  updateUserStatus
} from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, authorize("admin"));
router.get("/overview", getAdminOverview);
router.get("/users", getUsers);
router.post("/users", createUser);
router.patch("/users/bulk-approve", bulkApproveUsers);
router.post("/users/bulk-delete", bulkDeleteUsers);
router.patch("/users/:id", updateUserStatus);
router.delete("/users/:id", deleteUser);
router.get("/reports", getReports);
router.get("/settings/institute", getInstituteSettings);
router.put("/settings/institute", updateInstituteSettings);

export default router;
