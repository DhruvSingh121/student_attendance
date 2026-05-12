import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["low_attendance", "info", "warning"], default: "low_attendance" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
