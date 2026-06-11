import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  name: string;
  createdAt: Date;
}

const RoomSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

const Room = mongoose.model<IRoom>('Room', RoomSchema);
export default Room;
