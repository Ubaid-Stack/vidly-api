import mongoose from "mongoose";

const customersSchema = new mongoose.Schema(
  {
    isGold: { type: Boolean, default: false },
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 30,
      trim: true,
    },
    phone: { type: String, required: true, minlength: 5, maxlength: 20 },
  },
  {
    timestamps: true,
  },
);

const Customer = mongoose.model("Customer", customersSchema);

export default Customer;
