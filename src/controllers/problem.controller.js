import { Problem } from "../models/problem.model.js";
import { Doctor } from "../models/doctor.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const addProblem = asyncHandler(async (req, res) => {
  if (req.userRole !== "patient") {
    throw new ApiError(403, "Only patients can submit problems");
  }

  const { doctor, title, description, severity, date } = req.body;

  if (!doctor || !title || !description || !severity) {
    throw new ApiError(400, "Doctor, title, description, and severity are required");
  }

  const doctorExists = await Doctor.findById(doctor).select("_id");
  if (!doctorExists) {
    throw new ApiError(404, "Selected doctor not found");
  }

  const newProblem = await Problem.create({
    patient: req.user._id,
    doctor,
    title,
    description,
    severity,
    date,
  });

  return res.status(201).json(
    new ApiResponse(201, newProblem, "Problem submitted successfully")
  );
});

export const getMyProblems = asyncHandler(async (req, res) => {
  if (req.userRole !== "patient") {
    throw new ApiError(403, "Only patients can view their problems");
  }

  const problems = await Problem.find({ patient: req.user._id })
    .populate("doctor", "fullName username email specialty")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, problems, "Problems fetched"));
});

export const getAllProblems = asyncHandler(async (req, res) => {
  if (req.userRole !== "doctor") {
    throw new ApiError(403, "Only doctors can view all assigned problems");
  }

  const filter = { doctor: req.user._id };
  if (req.query.patient) {
    filter.patient = req.query.patient;
  }

  const problems = await Problem.find(filter)
    .populate("patient", "fullName email username")
    .populate("doctor", "fullName email username specialty")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, problems, "Problems fetched"));
});

export const updateProblemStatus = asyncHandler(async (req, res) => {
  if (req.userRole !== "doctor") {
    throw new ApiError(403, "Only doctors can update problem status");
  }

  const { id } = req.params;
  const { status } = req.body;

  const updated = await Problem.findOneAndUpdate(
    { _id: id, doctor: req.user._id },
    { status },
    { new: true }
  );

  if (!updated) {
    throw new ApiError(404, "Problem not found for this doctor");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Status updated"));
});
