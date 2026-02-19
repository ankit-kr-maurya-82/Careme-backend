import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dosage: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const adviceSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      default: null,
    },

    title: {
      type: String,
      trim: true,
      default: "General Advice",
    },

    message: {
      type: String,
      trim: true,
      required: true,
    },

    followUpDate: {
      type: Date,
      default: null,
    },

    medicine: {
      type: [medicineSchema],
      default: [],
    },

    tests: {
      type: [String],
      default: [],
      trim: true,
    },

    dietAdvice: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Compound index (optional but useful)
adviceSchema.index({ doctor: 1, patient: 1 });

const Advice = mongoose.model("Advice", adviceSchema);

export default Advice;
