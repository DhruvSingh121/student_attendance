import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    department: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Teacher", teacherSchema);
