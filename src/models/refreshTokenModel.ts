import { model, Schema } from "mongoose";

const refreshTokenSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    tokenId: {
      type: String,
      required: true,
    },
    hashedToken: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = model("RefreshToken", refreshTokenSchema);

export default RefreshToken;
