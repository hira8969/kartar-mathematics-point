import { jsPDF } from "jspdf";

const addLine = (doc, text, x, y, options = {}) => {
  doc.text(String(text), x, y, options);
};

export const downloadStudentAttendanceReportPdf = ({ studentName = "Student", totals, monthWiseSummary = [], subjectWiseSummary = [], dayWiseSummary = [] }) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let y = 48;

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(36, 28, 523, 72, 18, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  addLine(doc, "Student Attendance Report", 56, 58);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  addLine(doc, `${studentName} | Overall Attendance ${totals.percentage}%`, 56, 82);

  y = 130;
  const cards = [
    { label: "Present", value: totals.present, color: [16, 185, 129] },
    { label: "Absent", value: totals.absent, color: [244, 63, 94] },
    { label: "Total", value: totals.total, color: [14, 165, 233] },
    { label: "Overall %", value: `${totals.percentage}%`, color: [168, 85, 247] }
  ];

  cards.forEach((card, index) => {
    const x = 36 + (index * 130);
    doc.setFillColor(...card.color);
    doc.roundedRect(x, y, 118, 72, 16, 16, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    addLine(doc, card.label, x + 14, y + 22);
    doc.setFontSize(24);
    addLine(doc, card.value, x + 14, y + 52);
  });

  y += 110;
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  addLine(doc, "Month-Wise Summary", 36, y);
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  monthWiseSummary.slice(0, 6).forEach((item) => {
    addLine(doc, `${item.monthLabel}: Present ${item.present}, Absent ${item.absent}, Total ${item.total}, ${item.percentage}%`, 42, y);
    y += 16;
  });

  y += 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  addLine(doc, "Subject-Wise Summary", 36, y);
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  subjectWiseSummary.slice(0, 6).forEach((item) => {
    addLine(doc, `${item.subject}: Present ${item.present}, Absent ${item.absent}, Total ${item.total}, ${item.percentage}%`, 42, y);
    y += 16;
  });

  y += 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  addLine(doc, "Recent Day-Wise Attendance", 36, y);
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  dayWiseSummary.slice(0, 8).forEach((item) => {
    addLine(doc, `${item.dateLabel}: Present ${item.present}, Absent ${item.absent}, Total ${item.total}`, 42, y);
    y += 16;
  });

  doc.save(`${studentName.toLowerCase().replace(/\s+/g, "-")}-attendance-report.pdf`);
};
