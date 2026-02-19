import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// ✅ CORS
const normalizeOrigin = (value = "") => value.trim().replace(/\/+$/, "");

const envOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

const defaultOrigins = [
  "http://localhost:5173",
  "https://careme-fronted.vercel.app",
  "https://careme-frontend.vercel.app"
];

const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];
const allowAllOrigins = (process.env.CORS_ALLOW_ALL || "true").toLowerCase() === "true";

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowAllOrigins) return callback(null, true);
    return callback(null, allowedOrigins.includes(normalizeOrigin(origin)));
  },
  credentials: true
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

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
