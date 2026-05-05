import { jsPDF } from "jspdf";

const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const downloadTimetablePdf = ({ fileName, title, subtitle, entries, branding }) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let y = 46;

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(36, 24, 523, 88, 18, 18, "F");

  if (branding?.logoDataUrl) {
    try {
      doc.addImage(branding.logoDataUrl, "PNG", 48, 36, 52, 52);
    } catch (_error) {
      // Ignore image decode issues and keep the branded text header.
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(branding?.name || "Institute Timetable", 112, 52);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(branding?.address || "", 112, 68);
  doc.text(`Contact: ${branding?.contact || "-"}`, 112, 82);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(title, 360, 58, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(subtitle, 360, 78, { align: "center" });

  doc.setTextColor(15, 23, 42);
  y = 138;

  dayOrder.forEach((day) => {
    const dayEntries = entries.filter((entry) => entry.dayOfWeek === day);
    if (!dayEntries.length) {
      return;
    }

    if (y > 720) {
      doc.addPage();
      y = 46;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(day, 36, y);
    y += 18;

    dayEntries.forEach((entry) => {
      if (y > 760) {
        doc.addPage();
        y = 46;
      }

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(36, y, 523, 64, 12, 12, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(entry.title || "Class", 52, y + 20);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`${entry.startTime} - ${entry.endTime} | ${entry.room || "Room TBA"}`, 52, y + 36);
      doc.text(`${entry.subject || "General"} | Class ${entry.className || entry.course?.className || "-"} | Batch ${entry.batchName || entry.course?.batchName || "-"}`, 52, y + 50);
      if (entry.faculty?.name) {
        doc.text(`Faculty: ${entry.faculty.name}`, 330, y + 36);
      }
      y += 78;
    });

    y += 4;
  });

  doc.save(fileName);
};
