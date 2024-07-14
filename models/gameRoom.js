import { Schema, model, models } from "mongoose";


const gameRoomSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    
    players: [
      {
        type: Schema.Types.ObjectId,
        ref: "Player",
      },
    ],
    
  },
  { timestamps: true }
);

const gameRoom = models.GameRoom || model("GameRoom", gameRoomSchema);

export default gameRoom;
