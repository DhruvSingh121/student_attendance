import Attendance from "../models/Attendance.js";
import Class from "../models/Class.js";
import Notification from "../models/Notification.js";
import Student from "../models/Student.js";

const startOfDay = (dateValue) => {
  const date = new Date(dateValue);
  date.setHours(0, 0, 0, 0);
  return date;
};

const nextDay = (dateValue) => {
  const date = startOfDay(dateValue);
  date.setDate(date.getDate() + 1);
  return date;
};

const calculatePercentage = async (studentId) => {
  const records = await Attendance.find({ studentId });
  const total = records.length;
  const attended = records.filter((record) => ["present", "late"].includes(record.status)).length;
  return total === 0 ? 100 : Math.round((attended / total) * 100);
};

export const getStudentListForClass = async (req, res, next) => {
  try {
    const { classId } = req.query;
    if (!classId) return res.status(400).json({ message: "classId is required" });

    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({ message: "Class not found" });

    const students = await Student.find({ courseId: classDoc.courseId })
      .populate("user", "name email")
      .populate("courseId", "courseName courseCode")
      .sort({ rollNumber: 1 });

    return res.json(students);
  } catch (error) {
    return next(error);
  }
};

export const markAttendance = async (req, res, next) => {
  try {
    const { classId, date, records } = req.body;

    if (!classId || !date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: "classId, date and records are required" });
    }

    const attendanceDate = startOfDay(date);
    const operations = records.map((record) => ({
      updateOne: {
        filter: { studentId: record.studentId, classId, date: attendanceDate },
        update: {
          $set: {
            status: record.status,
            markedBy: req.user._id,
            studentId: record.studentId,
            classId,
            date: attendanceDate,
          },
        },
        upsert: true,
      },
    }));

    const result = await Attendance.bulkWrite(operations, { ordered: false });
    const threshold = Number(process.env.ATTENDANCE_THRESHOLD || 75);
    const notificationStart = startOfDay(new Date());
    const notificationEnd = nextDay(new Date());

    for (const record of records) {
      const percentage = await calculatePercentage(record.studentId);
      if (percentage < threshold) {
        const existing = await Notification.findOne({
          studentId: record.studentId,
          type: "low_attendance",
          createdAt: { $gte: notificationStart, $lt: notificationEnd },
        });

        if (!existing) {
          await Notification.create({
            studentId: record.studentId,
            message: `Attendance is ${percentage}%, below the required ${threshold}% threshold.`,
            type: "low_attendance",
          });
        }
      }
    }

    return res.status(201).json({ message: "Attendance saved successfully", result });
  } catch (error) {
    return next(error);
  }
};

export const getAttendanceByClassAndDate = async (req, res, next) => {
  try {
    const { classId, date } = req.query;
    if (!classId || !date) return res.status(400).json({ message: "classId and date are required" });

    const records = await Attendance.find({
      classId,
      date: { $gte: startOfDay(date), $lt: nextDay(date) },
    })
      .populate({ path: "studentId", populate: { path: "user", select: "name email" } })
      .populate("classId", "className semester")
      .sort({ date: -1 });

    return res.json(records);
  } catch (error) {
    return next(error);
  }
};

export const getMyAttendance = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id }).populate("user", "name email");
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const records = await Attendance.find({ studentId: student._id })
      .populate("classId", "className semester")
      .sort({ date: -1 });

    const total = records.length;
    const present = records.filter((record) => ["present", "late"].includes(record.status)).length;
    const absent = records.filter((record) => record.status === "absent").length;
    const percentage = total === 0 ? 0 : Math.round((present / total) * 100);

    return res.json({ student, records, stats: { total, present, absent, percentage } });
  } catch (error) {
    return next(error);
  }
};
