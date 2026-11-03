const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      required: true,
      enum: ["post", "comment"],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    reason: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true,
    },
  },
  { timestamps: true }
);

// One report per user per target
reportSchema.index(
  { reporterId: 1, targetType: 1, targetId: 1 },
  { unique: true }
);

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
