import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// ✅ CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

// ✅ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", (req, res) => {
  return res.send("Backend is Running");
});

// ✅ Routes import
import doctorRouter from "./routes/doctor.routes.js";
import patientRouter from "./routes/patient.routes.js";
import adviceRouter from "./routes/advice.routes.js";
import problemRouter from "./routes/problem.routes.js";
import appointmentRouter from "./routes/appointment.routes.js";

// ✅ Routes declaration
app.use("/api/doctors", doctorRouter);
app.use("/api/patient", patientRouter);
app.use("/api/advice", adviceRouter);
app.use("/api/problems", problemRouter);
app.use("/api/appointments", appointmentRouter);


// 🔥🔥🔥 VERY IMPORTANT 🔥🔥🔥
// ✅ Global Error Handler (ADD THIS)
app.use((err, req, res, next) => {
  console.error("ERROR:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export { app };
