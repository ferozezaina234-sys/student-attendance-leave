
const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  fromDate: { type: String, required: true },
  toDate: { type: String, required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviewNote: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Leave", leaveSchema);
