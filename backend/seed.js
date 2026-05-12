import dotenv from "dotenv";
dotenv.config({ path: "./config/.env" });
import mongoose from "mongoose";
import Attendance from "./models/Attendance.js";
import Class from "./models/Class.js";
import Course from "./models/Course.js";
import Notification from "./models/Notification.js";
import Student from "./models/Student.js";
import Teacher from "./models/Teacher.js";
import User from "./models/User.js";

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  await Promise.all([
    Attendance.deleteMany({}),
    Notification.deleteMany({}),
    Class.deleteMany({}),
    Student.deleteMany({}),
    Teacher.deleteMany({}),
    Course.deleteMany({}),
    User.deleteMany({}),
  ]);

  const admin = await User.create({
    name: "Admin User",
    email: "admin@demo.com",
    password: "Admin@123",
    role: "admin",
  });

  const teacherUser = await User.create({
    name: "Priya Singh",
    email: "teacher@demo.com",
    password: "Teacher@123",
    role: "teacher",
  });

  const studentUser = await User.create({
    name: "Rahul Sharma",
    email: "student@demo.com",
    password: "Student@123",
    role: "student",
  });

  const bca = await Course.create({
    courseName: "BCA",
    courseCode: "BCA-2Y",
    description: "Bachelor of Computer Applications second-year track.",
    managedBy: admin._id,
  });

  const bsc = await Course.create({
    courseName: "BSC",
    courseCode: "BSC-3Y",
    description: "Bachelor of Science three-year track.",
    managedBy: admin._id,
  });

  const teacher = await Teacher.create({ user: teacherUser._id, department: "Computer Science" });
  const student = await Student.create({ user: studentUser._id, rollNumber: "101", courseId: bca._id });
  const bcaClass = await Class.create({
    className: "BCA 2nd Year",
    semester: "4",
    courseId: bca._id,
    teacherId: teacher._id,
  });

  console.log("Seed data created");
  console.table({
    admin: admin._id.toString(),
    teacherUser: teacherUser._id.toString(),
    studentUser: studentUser._id.toString(),
    bca: bca._id.toString(),
    bsc: bsc._id.toString(),
    teacher: teacher._id.toString(),
    student: student._id.toString(),
    class: bcaClass._id.toString(),
  });

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
