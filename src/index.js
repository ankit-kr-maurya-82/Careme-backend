import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config();

// Initialize DB once per serverless runtime instance.
await connectDB();

export default app;
