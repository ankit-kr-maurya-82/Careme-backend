import jwt from "jsonwebtoken";
import { Doctor } from "../models/doctor.model.js";
import { Patient } from "../models/patient.model.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization") || req.header("authorization");
    const authHeaderToken = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
    const token = authHeaderToken || req.cookies?.accessToken;

    if (!token) {
      return next(new ApiError(401, "Unauthorized request"));
    }

    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    let user = await Doctor.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      user = await Patient.findById(decodedToken?._id).select(
        "-password -refreshToken"
      );
    }

    if (!user) return next(new ApiError(401, "Invalid Access Token: user not found"));

    req.user = user;
    req.userRole = decodedToken?.role;
    next();
  } catch (error) {
    return next(
      new ApiError(401, error?.message || "Invalid access token")
    );
  }
};
