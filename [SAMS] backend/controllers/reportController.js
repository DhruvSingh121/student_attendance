import Attendance from "../models/Attendance.js";
import Class from "../models/Class.js";
import Student from "../models/Student.js";

const monthBounds = (month, year) => {
  const monthIndex = Number(month) - 1;
  const start = new Date(Number(year), monthIndex, 1);
  const end = new Date(Number(year), monthIndex + 1, 1);
  return { start, end };
};

export const getClassReport = async (req, res, next) => {
  try {
    const { classId, month, year } = req.query;
    if (!classId || !month || !year) return res.status(400).json({ message: "classId, month and year are required" });

    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({ message: "Class not found" });

    const students = await Student.find({ courseId: classDoc.courseId }).populate("user", "name email").sort({ rollNumber: 1 });
    const { start, end } = monthBounds(month, year);
    const records = await Attendance.find({ classId, date: { $gte: start, $lt: end } });

    const report = students.map((student) => {
      const studentRecords = records.filter((record) => record.studentId.toString() === student._id.toString());
      const present = studentRecords.filter((record) => record.status === "present").length;
      const absent = studentRecords.filter((record) => record.status === "absent").length;
      const late = studentRecords.filter((record) => record.status === "late").length;
      const total = studentRecords.length;
      const percentage = total === 0 ? 0 : Math.round(((present + late) / total) * 100);

      return {
        studentId: student._id,
        rollNumber: student.rollNumber,
        name: student.user?.name || "Unknown",
        email: student.user?.email || "",
        present,
        absent,
        late,
        total,
        percentage,
      };
    });

    return res.json(report);
  } catch (error) {
    return next(error);
  }
};

export const getWeeklyReport = async (req, res, next) => {
  try {
    const { classId } = req.query;
    if (!classId) return res.status(400).json({ message: "classId is required" });

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const start = new Date(today);
    start.setDate(start.getDate() - 27);
    start.setHours(0, 0, 0, 0);

    const records = await Attendance.find({ classId, date: { $gte: start, $lte: today } });
    const weeks = Array.from({ length: 4 }, (_, index) => {
      const weekStart = new Date(start);
      weekStart.setDate(start.getDate() + index * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekRecords = records.filter((record) => record.date >= weekStart && record.date <= weekEnd);
      const present = weekRecords.filter((record) => ["present", "late"].includes(record.status)).length;
      const absent = weekRecords.filter((record) => record.status === "absent").length;
      const total = weekRecords.length;
      const percentage = total === 0 ? 0 : Math.round((present / total) * 100);

      return {
        label: `Week ${index + 1}`,
        total,
        present,
        absent,
        percentage,
      };
    });

    return res.json(weeks);
  } catch (error) {
    return next(error);
  }
};
