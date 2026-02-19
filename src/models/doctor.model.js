import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const doctorSchema = new mongoose.Schema(
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
    specialty: {
         type: String, 
         default: "" 
        },
    phone: { 
        type: String, 
        default: "" 
    },
    avatar: { 
        type: String, 
        default: "" 
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
        default: ""
    },
    age: {
        type: Number,
        default: null
    },
    nmcNumber: {
        type: String,
        default: ""
    },
    refreshToken: { 
        type: String, 
        default: "" 
    },
  },
  { timestamps: true }
);

// 🔐 Hash password before saving
doctorSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// 🔑 Password check
doctorSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// 🎟️ Access token
doctorSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
      role: "doctor",
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

// 🔁 Refresh token
doctorSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id, role: "doctor" },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const Doctor = mongoose.model("Doctor", doctorSchema);
