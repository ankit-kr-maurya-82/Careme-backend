import express from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import {
  cancelMyAppointment,
  createAppointment,
  getDoctorAppointments,
  getMyAppointments,
  updateDoctorAppointmentStatus,
} from "../controllers/appointment.controller.js";

const router = express.Router();

router.post("/", verifyJWT, createAppointment);
router.get("/my", verifyJWT, getMyAppointments);
router.get("/doctor", verifyJWT, getDoctorAppointments);
router.patch("/:id/cancel", verifyJWT, cancelMyAppointment);
router.patch("/:id/status", verifyJWT, updateDoctorAppointmentStatus);

export default router;
