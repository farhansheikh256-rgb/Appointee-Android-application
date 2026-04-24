const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    dr_name: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
    },

    dr_degree: {
      type: String,
      required: [true, "Doctor degree is required"],
      trim: true,
    },

    dr_email: {
      type: String,
      required: [true, "Doctor email is required"],
      lowercase: true,
      trim: true,
    },

    dr_mobile_number: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number"],
    },

    dr_city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },

    dr_address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },

    dr_password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },

    // OTP Fields
    otp_code: {
      type: String,
      default: null,
    },
    otp_verification_id: {
      type: String,
      default: null,
    },
    otp_expires_at: {
      type: Date,
      default: null,
    },
    is_mobile_verified: {
      type: Boolean,
      default: false,
    },
    otp_attempts: {
      type: Number,
      default: 0,
    },
    last_otp_sent_at: {
      type: Date,
      default: null,
    },
    is_temp: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Method to check if OTP is expired
doctorSchema.methods.isOtpExpired = function() {
  return this.otp_expires_at && this.otp_expires_at < new Date();
};

// Method to clear OTP data
doctorSchema.methods.clearOtpData = function() {
  this.otp_code = null;
  this.otp_verification_id = null;
  this.otp_expires_at = null;
  this.otp_attempts = 0;
  this.last_otp_sent_at = null;
};

module.exports = mongoose.model("Doctor", doctorSchema);