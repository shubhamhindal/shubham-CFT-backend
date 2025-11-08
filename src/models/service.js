const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: { type: String, required: true },
    type: { type: String, enum: ["Normal", "VIP"], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
