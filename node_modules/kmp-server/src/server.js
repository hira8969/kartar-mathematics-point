import path from "path";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { fileURLToPath } from "url";
import { connectDb } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { INSTITUTE_DETAILS } from "./constants.js";
import { ensureSuperAdmin } from "./utils/bootstrap.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true, limit: "12mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Kartar Mathematics Point backend is running.",
    frontend: process.env.CLIENT_URL || "http://localhost:5173",
    health: "/api/health",
    loginApi: "/api/auth/login",
    note: "Open the React app in the frontend URL for /login and other pages."
  });
});

app.get("/login", (_req, res) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  res.redirect(clientUrl + "/login");
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", institute: INSTITUTE_DETAILS });
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/timetables", timetableRoutes);
app.use(notFound);
app.use(errorHandler);

connectDb()
  .then(async () => {
    await ensureSuperAdmin();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
  });
