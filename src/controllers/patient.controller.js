import { Patient } from "../models/patient.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};

// Register new patient
 const registerPatient = asyncHandler(async (req, res) => {
  const { fullName, email, password, age, gender } = req.body;
  // Basic server-side validation to avoid Mongoose 500s
  if (!fullName || !String(fullName).trim()) throw new ApiError(400, "Full name is required");
  if (!email || !String(email).trim()) throw new ApiError(400, "Email is required");
  if (!password || String(password).length < 6) throw new ApiError(400, "Password must be at least 6 characters");
  // generate a unique username (based on email or fullname)
  const makeBase = () => {
    if (email && email.includes("@")) return email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    if (fullName) return fullName.split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    return "user";
  };

  const generateUniqueUsername = async (base) => {
    let candidate = base;
    let i = 0;
    while (i < 20) {
      const exists = await Patient.findOne({ username: candidate });
      if (!exists) return candidate;
      i += 1;
      candidate = `${base}${Math.floor(Math.random() * 9000) + 1000}`;
    }
    return `${base}${Date.now()}`;
  };

  const base = makeBase();
  const username = await generateUniqueUsername(base);

  const patient = await Patient.create({
    username,
    fullName,
    email,
    password,
    age,
    gender
  });
  const createdPatient = await Patient
    .findById(patient._id)
    .select("-password -refreshToken");
  if (!createdPatient) throw new ApiError(500, "Failed to create patient");
  const accessToken = createdPatient.generateAccessToken();
  const refreshToken = createdPatient.generateRefreshToken();
  await Patient.findByIdAndUpdate(
    createdPatient._id,
    { refreshToken },
    { new: true }
  );
  res
    .status(201)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(201, { user: createdPatient, accessToken, refreshToken }, "Patient registered successfully"));
});


// login patient
 const loginPatient = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const patient = await Patient.findOne({ email });
  if (!patient) throw new ApiError(401, "Invalid email or password");
  const isPasswordValid = await patient.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid email or password");
  const accessToken = patient.generateAccessToken();
  const refreshToken = patient.generateRefreshToken();
  await Patient.findByIdAndUpdate(
    patient._id,
    { refreshToken },
    { new: true }
  );
  const patientData = await Patient.findById(patient._id).select("-password -refreshToken");
  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, { user: patientData, accessToken, refreshToken }, "Patient logged in successfully"));
});



// GET patient profile by ID
 const getPatientProfile = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id).select("-password -refreshToken");
  if (!patient) throw new ApiError(404, "Patient not found");

  res.status(200).json(new ApiResponse(200, { patient }, "Patient profile fetched"));
});

// UPDATE patient profile
 const updatePatientProfile = asyncHandler(async (req, res) => {
  const patientId = req.user._id; // JWT user id
  const { username, fullName, age, gender, avatar } = req.body;

  // If username provided, ensure it's not taken by another patient
  if (username) {
    const existing = await Patient.findOne({ username });
    if (existing && String(existing._id) !== String(patientId)) {
      throw new ApiError(400, "Username already taken");
    }
  }

  const updatedPatient = await Patient.findByIdAndUpdate(
    patientId,
    { $set: { username, fullName, age, gender, avatar } },
    { new: true }
  ).select("-password -refreshToken");

  if (!updatedPatient) throw new ApiError(404, "Patient not found");

  res.status(200).json(new ApiResponse(200, { patient: updatedPatient }, "Patient profile updated"));
});

// GET all patients
 const getAllPatients = asyncHandler(async (req, res) => {
  const patients = await Patient.find().select("-password -refreshToken").sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { patients }, "All patients fetched"));
});

export { registerPatient, loginPatient, getPatientProfile, updatePatientProfile, getAllPatients };
