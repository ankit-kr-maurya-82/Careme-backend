import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Advice from "../models/advice.model.js";
import { decryptAdviceText, encryptAdviceText } from "../utils/adviceCrypto.js";

const mapDecryptedAdvice = (advice) => {
  const doc = typeof advice?.toObject === "function" ? advice.toObject() : advice;

  return {
    ...doc,
    message: decryptAdviceText(doc?.message || ""),
    dietAdvice: decryptAdviceText(doc?.dietAdvice || ""),
  };
};

export const createAdvice = asyncHandler(async (req, res) => {
  const { patient, problem, title, message, followUpDate, medicine, tests, dietAdvice } =
    req.body;

  if (req.userRole !== "doctor") {
    throw new ApiError(403, "Only doctors can create advice");
  }

  if (!patient) {
    throw new ApiError(400, "Patient is required");
  }

  const normalizedMessage = String(message || dietAdvice || "").trim();
  if (!normalizedMessage) {
    throw new ApiError(400, "Advice message is required");
  }

  const advice = await Advice.create({
    doctor: req.user._id,
    patient,
    problem: problem || null,
    title: String(title || "").trim() || "General Advice",
    message: encryptAdviceText(normalizedMessage),
    followUpDate: followUpDate || null,
    medicine: Array.isArray(medicine) ? medicine : [],
    tests: Array.isArray(tests) ? tests : [],
    dietAdvice: encryptAdviceText(String(dietAdvice || "").trim()),
  });

  const populatedAdvice = await Advice.findById(advice._id)
    .populate("doctor", "username fullName email")
    .populate("patient", "username fullName email")
    .populate("problem");

  return res.status(201).json(
    new ApiResponse(
      201,
      mapDecryptedAdvice(populatedAdvice),
      "Advice created successfully"
    )
  );
});

export const getDoctorAdvices = asyncHandler(async (req, res) => {
  if (req.userRole !== "doctor") {
    throw new ApiError(403, "Only doctors can view doctor advice list");
  }

  const advices = await Advice.find({ doctor: req.user._id })
    .populate("patient", "username fullName email")
    .populate("problem")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, advices.map(mapDecryptedAdvice), "Doctor advices fetched"));
});

export const getPatientAdvices = asyncHandler(async (req, res) => {
  if (req.userRole !== "patient") {
    throw new ApiError(403, "Only patients can view patient advice list");
  }

  const advices = await Advice.find({ patient: req.user._id })
    .populate("doctor", "username fullName email")
    .populate("problem")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, advices.map(mapDecryptedAdvice), "Patient advices fetched"));
});

export const getSingleAdvice = asyncHandler(async (req, res) => {
  const { adviceId } = req.params;

  const advice = await Advice.findById(adviceId)
    .populate("doctor", "username fullName email")
    .populate("patient", "username fullName email")
    .populate("problem");

  if (!advice) {
    throw new ApiError(404, "Advice not found");
  }

  const isDoctorOwner =
    req.userRole === "doctor" &&
    advice.doctor &&
    String(advice.doctor._id || advice.doctor) === String(req.user._id);
  const isPatientOwner =
    req.userRole === "patient" &&
    advice.patient &&
    String(advice.patient._id || advice.patient) === String(req.user._id);

  if (!isDoctorOwner && !isPatientOwner) {
    throw new ApiError(403, "Unauthorized to access this advice");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, mapDecryptedAdvice(advice), "Advice fetched"));
});

export const deleteAdvice = asyncHandler(async (req, res) => {
  const { adviceId } = req.params;

  const advice = await Advice.findById(adviceId);
  if (!advice) {
    throw new ApiError(404, "Advice not found");
  }

  if (req.userRole !== "doctor" || String(advice.doctor) !== String(req.user._id)) {
    throw new ApiError(403, "Unauthorized to delete this advice");
  }

  await advice.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Advice deleted successfully"));
});
