import express from "express";
import {
  addProblem,
  getMyProblems,
  getAllProblems,
  updateProblemStatus,
} from "../controllers/problem.controller.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";

const router = express.Router();

router.post("/", verifyJWT, addProblem);
router.get("/my", verifyJWT, getMyProblems);
router.get("/", verifyJWT, getAllProblems);
router.patch("/:id", verifyJWT, updateProblemStatus);

export default router;
