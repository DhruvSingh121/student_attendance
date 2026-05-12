import dotenv from "dotenv";
dotenv.config({ path: "./config/.env" });
import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import morgan from "morgan";
import attendanceRoutes from "./routes/attendance.routes.js";
import authRoutes from "./routes/Auth.routes.js";
import classRoutes from "./routes/class.routes.js";
import courseRoutes from "./routes/course.routes.js";
import notificationRoutes from "./routes/Notification.routes.js";
import reportRoutes from "./routes/report.routes.js";
import userRoutes from "./routes/User.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "AttendX API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);

app.use((err, _req, res, _next) => {
  const status = err.statusCode || err.status || 500;
  const message = err.code === 11000 ? "A record with this unique value already exists" : err.message || "Server error";
  res.status(status).json({ message });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`AttendX API running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  });
