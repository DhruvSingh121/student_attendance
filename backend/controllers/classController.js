import Class from "../models/Class.js";
import Teacher from "../models/Teacher.js";

const classPopulate = [
  { path: "courseId", select: "courseName courseCode" },
  { path: "teacherId", populate: { path: "user", select: "name email" } },
];

export const getAllClasses = async (_req, res, next) => {
  try {
    const classes = await Class.find().populate(classPopulate).sort({ createdAt: -1 });
    return res.json(classes);
  } catch (error) {
    return next(error);
  }
};

export const getMyClasses = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) return res.json([]);
    const classes = await Class.find({ teacherId: teacher._id }).populate(classPopulate).sort({ createdAt: -1 });
    return res.json(classes);
  } catch (error) {
    return next(error);
  }
};

export const createClass = async (req, res, next) => {
  try {
    const createdClass = await Class.create(req.body);
    const populated = await createdClass.populate(classPopulate);
    return res.status(201).json(populated);
  } catch (error) {
    return next(error);
  }
};

export const updateClass = async (req, res, next) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(
      classPopulate
    );
    if (!updatedClass) return res.status(404).json({ message: "Class not found" });
    return res.json(updatedClass);
  } catch (error) {
    return next(error);
  }
};

export const deleteClass = async (req, res, next) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    if (!deletedClass) return res.status(404).json({ message: "Class not found" });
    return res.json({ message: "Class deleted successfully" });
  } catch (error) {
    return next(error);
  }
};
