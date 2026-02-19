import { Appointment } from "../models/appointment.model.js";
import { Doctor } from "../models/doctor.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const APPOINTMENT_STATUSES = new Set(["Scheduled", "Confirmed", "Completed", "Cancelled"]);

export const createAppointment = asyncHandler(async (req, res) => {
  if (req.userRole !== "patient") {
    throw new ApiError(403, "Only patients can book appointments");
  }

  const { doctorId, date, time, reason } = req.body;

  if (!doctorId || !date || !time) {
    throw new ApiError(400, "doctorId, date and time are required");
  }

  const doctorExists = await Doctor.findById(doctorId).select("_id");
  if (!doctorExists) {
    throw new ApiError(404, "Doctor not found");
  }

  const dateTime = new Date(`${date}T${time}`);
  if (Number.isNaN(dateTime.getTime())) {
    throw new ApiError(400, "Invalid appointment date/time");
  }
  if (dateTime < new Date()) {
    throw new ApiError(400, "Appointment must be in the future");
  }

  const created = await Appointment.create({
    patient: req.user._id,
    doctor: doctorId,
    dateTime,
    reason: String(reason || "").trim(),
  });

  const appointment = await Appointment.findById(created._id)
    .populate("doctor", "fullName username email specialty")
    .populate("patient", "fullName username email");

  return res.status(201).json(new ApiResponse(201, appointment, "Appointment booked"));
});

export const getMyAppointments = asyncHandler(async (req, res) => {
  if (req.userRole !== "patient") {
    throw new ApiError(403, "Only patients can view their appointments");
  }

  const appointments = await Appointment.find({ patient: req.user._id })
    .populate("doctor", "fullName username email specialty")
    .sort({ dateTime: 1 });

  return res.status(200).json(new ApiResponse(200, appointments, "Appointments fetched"));
});

export const getDoctorAppointments = asyncHandler(async (req, res) => {
  if (req.userRole !== "doctor") {
    throw new ApiError(403, "Only doctors can view doctor appointments");
  }

  const appointments = await Appointment.find({ doctor: req.user._id })
    .populate("patient", "fullName username email")
    .sort({ dateTime: 1 });

  return res.status(200).json(new ApiResponse(200, appointments, "Appointments fetched"));
});

export const cancelMyAppointment = asyncHandler(async (req, res) => {
  if (req.userRole !== "patient") {
    throw new ApiError(403, "Only patients can cancel their appointments");
  }

  const appointment = await Appointment.findOneAndUpdate(
    { _id: req.params.id, patient: req.user._id },
    { status: "Cancelled" },
    { new: true }
  ).populate("doctor", "fullName username email specialty");

  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  return res.status(200).json(new ApiResponse(200, appointment, "Appointment cancelled"));
});

export const updateDoctorAppointmentStatus = asyncHandler(async (req, res) => {
  if (req.userRole !== "doctor") {
    throw new ApiError(403, "Only doctors can update appointment status");
  }

  const { status } = req.body;
  if (!APPOINTMENT_STATUSES.has(status)) {
    throw new ApiError(400, "Invalid status");
  }

  const appointment = await Appointment.findOneAndUpdate(
    { _id: req.params.id, doctor: req.user._id },
    { status },
    { new: true }
  ).populate("patient", "fullName username email");

  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  return res.status(200).json(new ApiResponse(200, appointment, "Appointment updated"));
});
