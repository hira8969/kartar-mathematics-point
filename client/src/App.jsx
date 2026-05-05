import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import ToastViewport from "./components/ToastViewport";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminAnnouncementsPage from "./pages/dashboard/AdminAnnouncementsPage";
import AdminCoursesPage from "./pages/dashboard/AdminCoursesPage";
import AdminDashboardPage from "./pages/dashboard/AdminDashboardPage";
import AdminOversightPage from "./pages/dashboard/AdminOversightPage";
import AdminProfilePage from "./pages/dashboard/AdminProfilePage";
import AdminReportsPage from "./pages/dashboard/AdminReportsPage";
import AdminSettingsPage from "./pages/dashboard/AdminSettingsPage";
import AdminTimetablePage from "./pages/dashboard/AdminTimetablePage";
import AdminUsersPage from "./pages/dashboard/AdminUsersPage";
import FacultyAnnouncementsPage from "./pages/dashboard/FacultyAnnouncementsPage";
import FacultyAssignmentsPage from "./pages/dashboard/FacultyAssignmentsPage";
import FacultyAttendancePage from "./pages/dashboard/FacultyAttendancePage";
import FacultyCoursesPage from "./pages/dashboard/FacultyCoursesPage";
import FacultyDashboardPage from "./pages/dashboard/FacultyDashboardPage";
import FacultyExamsPage from "./pages/dashboard/FacultyExamsPage";
import FacultyProfilePage from "./pages/dashboard/FacultyProfilePage";
import FacultyTimetablePage from "./pages/dashboard/FacultyTimetablePage";
import StudentAnnouncementsPage from "./pages/dashboard/StudentAnnouncementsPage";
import StudentAssignmentsPage from "./pages/dashboard/StudentAssignmentsPage";
import StudentAttendancePage from "./pages/dashboard/StudentAttendancePage";
import StudentCoursesPage from "./pages/dashboard/StudentCoursesPage";
import StudentDashboardPage from "./pages/dashboard/StudentDashboardPage";
import StudentExamsPage from "./pages/dashboard/StudentExamsPage";
import StudentProfilePage from "./pages/dashboard/StudentProfilePage";
import StudentTimetablePage from "./pages/dashboard/StudentTimetablePage";
import CertificateVerifyPage from "./pages/public/CertificateVerifyPage";
import ContactPage from "./pages/public/ContactPage";
import LandingPage from "./pages/public/LandingPage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";

export default function App() {
  return (
    <>
      <ToastViewport />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-certificate/:certificateNumber" element={<CertificateVerifyPage />} />

        <Route element={<ProtectedRoute roles={["student", "faculty", "admin"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/student" element={<ProtectedRoute roles={["student"]} />}>
              <Route index element={<StudentDashboardPage />} />
              <Route path="courses" element={<StudentCoursesPage />} />
              <Route path="assignments" element={<StudentAssignmentsPage />} />
              <Route path="exams" element={<StudentExamsPage />} />
              <Route path="attendance" element={<StudentAttendancePage />} />
              <Route path="timetable" element={<StudentTimetablePage />} />
              <Route path="announcements" element={<StudentAnnouncementsPage />} />
              <Route path="profile" element={<StudentProfilePage />} />
            </Route>

            <Route path="/faculty" element={<ProtectedRoute roles={["faculty"]} />}>
              <Route index element={<FacultyDashboardPage />} />
              <Route path="courses" element={<FacultyCoursesPage />} />
              <Route path="assignments" element={<FacultyAssignmentsPage />} />
              <Route path="exams" element={<FacultyExamsPage />} />
              <Route path="attendance" element={<FacultyAttendancePage />} />
              <Route path="timetable" element={<FacultyTimetablePage />} />
              <Route path="announcements" element={<FacultyAnnouncementsPage />} />
              <Route path="profile" element={<FacultyProfilePage />} />
            </Route>

            <Route path="/admin" element={<ProtectedRoute roles={["admin"]} />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="courses" element={<AdminCoursesPage />} />
              <Route path="oversight" element={<AdminOversightPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="timetable" element={<AdminTimetablePage />} />
              <Route path="announcements" element={<AdminAnnouncementsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="profile" element={<AdminProfilePage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
