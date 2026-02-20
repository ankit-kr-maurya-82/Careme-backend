import express from "express";
import { getPatientProfile, updatePatientProfile, getAllPatients, registerPatient, loginPatient } from "../controllers/patient.controller.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/register", registerPatient); // Patient registration
router.post("/login", loginPatient);      // Patient login
router.get("/", getAllPatients);
router.get("/:id", getPatientProfile);
router.put("/update", verifyJWT, upload.single("avatar"), updatePatientProfile); // patient updates their own profile

export default router;
