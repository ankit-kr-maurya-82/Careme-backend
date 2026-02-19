import express from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import {
  createAdvice,
  getDoctorAdvices,
  getPatientAdvices,
  getSingleAdvice,
  deleteAdvice,
} from "../controllers/advice.controller.js";

const router = express.Router();

router.post("/", verifyJWT, createAdvice);
router.get("/doctor", verifyJWT, getDoctorAdvices);
router.get("/patient", verifyJWT, getPatientAdvices);
router.get("/:adviceId", verifyJWT, getSingleAdvice);
router.delete("/:adviceId", verifyJWT, deleteAdvice);

export default router;
