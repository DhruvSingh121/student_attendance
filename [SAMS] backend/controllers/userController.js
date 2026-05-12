import User from "../models/User.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";

const createProfileForUser = async (user, body) => {
  if (user.role === "student") {
    if (!body.rollNumber || !body.courseId) {
      throw Object.assign(new Error("Roll number and course are required for students"), { statusCode: 400 });
    }
    await Student.create({ user: user._id, rollNumber: body.rollNumber, courseId: body.courseId });
  }

  if (user.role === "teacher") {
    if (!body.department) {
      throw Object.assign(new Error("Department is required for teachers"), { statusCode: 400 });
    }
    await Teacher.create({ user: user._id, department: body.department });
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const filter = req.query.role ? { role: req.query.role } : {};
    const users = await User.find(filter).sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    return next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (error) {
    return next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.create({ name, email, password, role });
    await createProfileForUser(user, req.body);
    return res.status(201).json(user);
  } catch (error) {
    return next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const allowed = ["name", "email", "role"];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (error) {
    return next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await Promise.all([Student.deleteOne({ user: user._id }), Teacher.deleteOne({ user: user._id })]);
    await user.deleteOne();
    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

export const getAllStudents = async (_req, res, next) => {
  try {
    const students = await Student.find()
      .populate("user", "name email")
      .populate("courseId", "courseName courseCode")
      .sort({ createdAt: -1 });
    return res.json(students);
  } catch (error) {
    return next(error);
  }
};

export const getAllTeachers = async (_req, res, next) => {
  try {
    const teachers = await Teacher.find().populate("user", "name email").sort({ createdAt: -1 });
    return res.json(teachers);
  } catch (error) {
    return next(error);
  }
};

export const getDashboardStats = async (_req, res, next) => {
  try {
    const [totalStudents, totalTeachers, totalUsers] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      User.countDocuments(),
    ]);
    return res.json({ totalStudents, totalTeachers, totalUsers });
  } catch (error) {
    return next(error);
  }
};
