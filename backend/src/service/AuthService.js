// src/service/AuthService.js
const { UserModel } = require("../models/User.model");
const ApiError = require("../utils/ApiError");
const bcryptjs = require("bcryptjs");
const JWTService = require("../utils/JwtService");
const { AccountModel } = require("../models/Account.model");
const { TransactionModel } = require("../models/Transactions.model");
const { FixDepositModel } = require("../models/FixDeposit.model");
const { ATMmodel } = require("../models/ATMCard.model");

class AuthService {
  // LOGIN
  static async loginUser(body) {
    const { email, password } = body;

    const user = await UserModel.findOne({ email: String(email).toLowerCase() });
    if (!user) throw new ApiError(400, "No Account Found");

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) throw new ApiError(400, "Invalid Credentials");

    // Optionally update lastLoginAt
    user.lastLoginAt = new Date();
    await user.save();

    const token = JWTService.generateToken(user._id);
    return { msg: "Login Success", token };
  }

  // REGISTER
  static async registerUser(body) {
    const { name, email, password, ac_type } = body;

    const exists = await UserModel.findOne({ email: String(email).toLowerCase() });
    if (exists) throw new ApiError(400, "Email Already Exist");

    const user = await UserModel.create({ name, email, password, ac_type });

    // Create primary account with opening transaction
    const ac = await AccountModel.create({
      user: user._id,
      amount: 0,
      ac_type: ac_type || "saving",
    });

    await TransactionModel.create({
      user: user._id,
      account: ac._id,
      amount: 0,
      type: "credit",
      isSuccess: true,
      remark: "Account Opening !",
    });

    const token = JWTService.generateToken(user._id);
    return { msg: "Register Success", token };
  }

  // PROFILE (read)
  static async profileUser(authUser) {
    // authUser can be an object (from req.user) or id
    const userId = authUser._id ? authUser._id : authUser;

    // Select core fields for UI; include optional profile attributes if present in schema
    const userDoc = await UserModel.findById(userId).select(
      "name email ac_type createdAt phone dob address role status avatarUrl emailVerified phoneVerified kycVerified kycStatus lastLoginAt"
    );

    if (!userDoc) throw new ApiError(401, "Profile Not Found");

    // Ensure there is at least one account
    let accounts = await AccountModel.find({ user: userId }).select("_id amount ac_type").lean();

    if (!accounts || accounts.length === 0) {
      const ac = await AccountModel.create({
        user: userId,
        amount: 0,
        ac_type: userDoc.ac_type || "saving",
      });

      await TransactionModel.create({
        user: userId,
        account: ac._id,
        amount: 0,
        type: "credit",
        isSuccess: true,
        remark: "Account Opening !",
      });

      accounts = [{ _id: ac._id, amount: ac.amount, ac_type: ac.ac_type }];
    }

    // FD summary (unclaimed)
    const fixDeposits = await FixDepositModel.find({ user: userId, isClaimed: false }).select("amount").lean();
    const fd_amount =
      fixDeposits && fixDeposits.length > 0
        ? fixDeposits.map((f) => f.amount).reduce((a, b) => a + b, 0)
        : 0;

    // ATM cards summary
    const atms = await ATMmodel.find({ user: userId }).select("_id card_type").lean();

    // Final normalized payload the UI expects
    const user = userDoc.toObject();
    return {
      ...user,
      accounts,      // [{ _id, amount, ac_type }]
      fd_amount,     // number
      atms,          // [{ _id, card_type }]
    };
  }

  // PROFILE (update)
  // Allows user to fill empty profile fields used by the UI
  static async updateProfile(authUser, body) {
    const userId = authUser._id ? authUser._id : authUser;

    // Allow-list fields to prevent accidental overwrites
    const allowed = new Set([
      "name",
      "phone",
      "dob",
      "address",
      "role",
      "status",
      "avatarUrl",
      "emailVerified",
      "phoneVerified",
      "kycVerified",
      "kycStatus",
      // Optional: allow email change only if you have verification flow
      // "email"
    ]);

    const update = {};
    for (const key of Object.keys(body || {})) {
      if (allowed.has(key)) update[key] = body[key];
    }

    // Normalize types
    if (update.dob) update.dob = new Date(update.dob);

    const updated = await UserModel.findByIdAndUpdate(userId, update, { new: true })
      .select(
        "name email ac_type createdAt phone dob address role status avatarUrl emailVerified phoneVerified kycVerified kycStatus lastLoginAt"
      )
      .lean();

    if (!updated) throw new ApiError(404, "User not found");

    // Enrich with accounts/FD/ATMs like profileUser so UI can refresh from this response if desired
    const accounts = await AccountModel.find({ user: userId }).select("_id amount ac_type").lean();
    const fixDeposits = await FixDepositModel.find({ user: userId, isClaimed: false }).select("amount").lean();
    const fd_amount =
      fixDeposits && fixDeposits.length > 0
        ? fixDeposits.map((f) => f.amount).reduce((a, b) => a + b, 0)
        : 0;
    const atms = await ATMmodel.find({ user: userId }).select("_id card_type").lean();

    return {
      ...updated,
      accounts,
      fd_amount,
      atms,
    };
  }
}

module.exports = AuthService;
