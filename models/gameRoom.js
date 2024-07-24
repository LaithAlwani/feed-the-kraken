import { Schema, model, models } from "mongoose";

const gameRoomSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required:true
    },
    players: [
      {
        type: Object,
      },
    ],
    gameAdmin: {
      type: String,
      required: true,
    },
    gameStarted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const gameRoom = models.GameRoom || model("GameRoom", gameRoomSchema);

export default gameRoom;
