import express from "express";
import { getDoctorProfile, updateDoctorProfile, getAllDoctors, registerDoctor, loginDoctor } from "../controllers/doctor.controller.js";
import { verifyJWT } from "../middlewares/verifyJWT.js"; // JWT auth middleware
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/register", registerDoctor); // Doctor registration
router.post("/login", loginDoctor);      // Doctor login
router.get("/", getAllDoctors);                 // GET all doctors
router.get("/:id", getDoctorProfile);           // GET doctor by ID
router.put("/update", verifyJWT, upload.single("avatar"), updateDoctorProfile); // update logged-in doctor

export default router;
