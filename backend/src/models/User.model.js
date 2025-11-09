// src/models/User.model.js
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lower: true,
      unique: true,
    },
    password: { type: String, required: true },
    ac_type: {
      type: String,
      required: true,
      enum: ["saving", "current"],
      default: "saving",
    },
    // NEW fields for profile completeness
    phone: { type: String, default: "" },
    dob: { type: Date },
    address: { type: String, default: "" },
    role: { type: String, default: "" },
    status: { type: String, default: "Active" },
    avatarUrl: { type: String, default: "" },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    kycVerified: { type: Boolean, default: false },
    kycStatus: { type: String, default: "" },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

schema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    this.password = await bcryptjs.hash(user.password, 10);
  }
  next();
});

const model = mongoose.model("user", schema);
exports.UserModel = model;
