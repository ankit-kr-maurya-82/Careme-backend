import jwt from "jsonwebtoken";
import { Doctor } from "../models/doctor.model.js";
import { Patient } from "../models/patient.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.header("Authorization") || req.header("authorization");
  const bearerToken = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() || null;
  const token = bearerToken || req.cookies?.accessToken;

  if (!token) throw new ApiError(401, "Access token missing");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired access token");
  }

  let user = await Doctor.findById(decoded._id).select("-password -refreshToken");
  if (!user) {
    user = await Patient.findById(decoded._id).select("-password -refreshToken");
  }
  if (!user) throw new ApiError(401, "User not found");

  req.user = user;
  next();
});
