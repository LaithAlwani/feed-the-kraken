import { Schema, model, models } from "mongoose";

const playerSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const player = models.Player || model("Player", playerSchema);

export default player;
