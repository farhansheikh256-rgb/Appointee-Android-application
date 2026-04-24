const mongoose = require("mongoose");

const mrSchema = new mongoose.Schema(
  {
    mr_name: {
      type: String,
      required: [true, "MR name is required"],
      trim: true,
    },

    mr_email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },

    mr_mobile_number: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number"],
    },

    mr_company_name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },

    mr_city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },

    mr_region: {
      type: String,
      required: [true, "Region is required"],
      trim: true,
    },

    mr_address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },

    mr_password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },

    experience_years: {
      type: Number,
      default: 0,
      min: 0,
      max: 50,
    },

    // Document URLs
    certificate_url: {
      type: String,
      default: null,
      trim: true,
    },

    profile_picture: {
      type: String,
      default: null,
      trim: true,
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

    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Method to check if OTP is expired
mrSchema.methods.isOtpExpired = function() {
  return this.otp_expires_at && this.otp_expires_at < new Date();
};

// Method to clear OTP data
mrSchema.methods.clearOtpData = function() {
  this.otp_code = null;
  this.otp_verification_id = null;
  this.otp_expires_at = null;
  this.otp_attempts = 0;
  this.last_otp_sent_at = null;
};

module.exports = mongoose.model("MedicalRepresentative", mrSchema);