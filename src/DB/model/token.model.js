import {model, Schema} from "mongoose";
const tokenSchema = new Schema(
  {
    token: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        // required: true
    },
    type: {
        type: String,
        enum: ["access", "refresh"],
        default: "access"
    },
    // createdAt: {
    //     type: Date,
    //     default: Date.now,
    //     expires: 3600 // 1 hour
    // }
  },
  {
    timestamps: true
  }
);

export const Token = model("Token", tokenSchema);
