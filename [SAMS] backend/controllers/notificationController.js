import Notification from "../models/Notification.js";
import Student from "../models/Student.js";

export const getMyNotifications = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const notifications = await Notification.find({ studentId: student._id }).sort({ createdAt: -1 });
    return res.json(notifications);
  } catch (error) {
    return next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    return res.json(notification);
  } catch (error) {
    return next(error);
  }
};

export const getAllNotifications = async (_req, res, next) => {
  try {
    const notifications = await Notification.find()
      .populate({ path: "studentId", populate: { path: "user", select: "name email" } })
      .sort({ createdAt: -1 });
    return res.json(notifications);
  } catch (error) {
    return next(error);
  }
};
