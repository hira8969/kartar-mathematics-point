import { Announcement } from "../models/Announcement.js";
import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";
import { sendMail } from "../utils/mailer.js";

const escapeHtml = (value = "") =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export const createAnnouncement = async (req, res) => {
  const title = req.body.title?.trim();
  const message = req.body.message?.trim();
  const scope = req.body.scope || "global";

  if (!title || !message) {
    return res.status(400).json({ message: "Title and message are required" });
  }

  if (scope === "course" && !req.body.course) {
    return res.status(400).json({ message: "Course is required for course announcements" });
  }

  const announcement = await Announcement.create({
    ...req.body,
    title,
    message,
    scope,
    createdBy: req.user._id
  });

  if (scope === "global") {
    const recipients = await User.find(
      { isSuspended: false, isApproved: true },
      "_id email name role"
    );

    if (recipients.length) {
      await Notification.insertMany(
        recipients.map((user) => ({
          user: user._id,
          title,
          message,
          type: "announcement",
          meta: {
            announcementId: announcement._id,
            scope
          }
        }))
      );

      const emailRecipients = recipients
        .map((user) => user.email)
        .filter(Boolean);

      if (emailRecipients.length) {
        const safeTitle = escapeHtml(title);
        const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");
        const safePublisher = escapeHtml(req.user.name);
        const subject = `New announcement: ${title}`;
        const text = `${message}\n\nPublished by ${req.user.name} (${req.user.role}).`;
        const html = `
          <div>
            <h2>${safeTitle}</h2>
            <p>${safeMessage}</p>
            <p><strong>Published by:</strong> ${safePublisher} (${req.user.role})</p>
          </div>
        `;

        try {
          await sendMail({ to: emailRecipients.join(","), subject, text, html });
        } catch (error) {
          console.error("Announcement email delivery failed", error);
        }
      }
    }
  }

  res.status(201).json(announcement);
};

export const getAnnouncements = async (req, res) => {
  const courseId = req.query.course;
  const filter = courseId
    ? { $or: [{ scope: "global" }, { scope: "course", course: courseId }] }
    : {};

  const announcements = await Announcement.find(filter)
    .populate("createdBy", "name role")
    .sort({ createdAt: -1 });

  res.json(announcements);
};
