import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const patientSchema = new mongoose.Schema(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    password: { 
      type: String, 
      required: true 
    },
    fullName: { 
      type: String, 
      required: true 
    },
    age: { 
      type: Number, 
      default: null 
    },
    gender: { 
      type: String, 
      enum: ["male", "female", "other"], 
      default: "" 
    
    },
    avatar: { type: 
      String, default: "" 
    },
    refreshToken: { 
      type: String, 
      default: "" 
    },
  },
  { timestamps: true }
);

// 🔐 Hash password before saving
patientSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// 🔑 Password check
patientSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// 🎟️ Access token
patientSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
      role: "patient",
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

// 🔁 Refresh token
patientSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id, role: "patient" },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const Patient = mongoose.model("Patient", patientSchema);
