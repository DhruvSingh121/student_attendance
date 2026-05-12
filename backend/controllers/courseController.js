import Course from "../models/Course.js";

export const getAllCourses = async (_req, res, next) => {
  try {
    const courses = await Course.find().populate("managedBy", "name email").sort({ createdAt: -1 });
    return res.json(courses);
  } catch (error) {
    return next(error);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate("managedBy", "name email");
    if (!course) return res.status(404).json({ message: "Course not found" });
    return res.json(course);
  } catch (error) {
    return next(error);
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const course = await Course.create({ ...req.body, managedBy: req.user._id });
    return res.status(201).json(course);
  } catch (error) {
    return next(error);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ message: "Course not found" });
    return res.json(course);
  } catch (error) {
    return next(error);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    return res.json({ message: "Course deleted successfully" });
  } catch (error) {
    return next(error);
  }
};
