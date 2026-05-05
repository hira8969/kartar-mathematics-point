export const dashboardPathByRole = {
  student: "/student",
  faculty: "/faculty",
  admin: "/admin"
};

export const navByRole = {
  student: [
    { to: "/student", label: "Dashboard" },
    { to: "/student/courses", label: "Courses" },
    { to: "/student/assignments", label: "Assignments" },
    { to: "/student/exams", label: "Exams" },
    { to: "/student/attendance", label: "Attendance" },
    { to: "/student/timetable", label: "Timetable" },
    { to: "/student/announcements", label: "Announcements" },
    { to: "/student/profile", label: "Profile" }
  ],
  faculty: [
    { to: "/faculty", label: "Dashboard" },
    { to: "/faculty/courses", label: "My Courses" },
    { to: "/faculty/assignments", label: "Assignments" },
    { to: "/faculty/exams", label: "Exams" },
    { to: "/faculty/attendance", label: "Attendance" },
    { to: "/faculty/timetable", label: "Timetable" },
    { to: "/faculty/announcements", label: "Announcements" },
    { to: "/faculty/profile", label: "Profile" }
  ],
  admin: [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/courses", label: "Courses" },
    { to: "/admin/oversight", label: "Oversight" },
    { to: "/admin/reports", label: "Reports" },
    { to: "/admin/timetable", label: "Timetable" },
    { to: "/admin/announcements", label: "Announcements" },
    { to: "/admin/settings", label: "Settings" },
    { to: "/admin/profile", label: "Profile" }
  ]
};
