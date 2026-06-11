import Room, { IRoom } from '../models/Room';
import Message, { IMessage } from '../models/Message';
import User, { IUser } from '../models/User';
import { Types } from 'mongoose';

class ChatService {
  /**
   * Retrieves all available chat rooms.
   */
  async getAllRooms(): Promise<IRoom[]> {
    return Room.find({});
  }

  /**
   * Creates a new chat room.
   * @param name The name of the room.
   */
  async createRoom(name: string): Promise<IRoom> {
    const newRoom = new Room({ name });
    await newRoom.save();
    return newRoom;
  }

  /**
   * Finds a room by its ID.
   * @param roomId The ID of the room.
   */
  async findRoomById(roomId: string | Types.ObjectId): Promise<IRoom | null> {
    return Room.findById(roomId);
  }

  /**
   * Finds or creates a user by username.
   * @param username The username of the user.
   */
  async findOrCreateUser(username: string): Promise<IUser> {
    let user = await User.findOne({ username });
    if (!user) {
      user = new User({ username });
      await user.save();
    }
    return user;
  }

  /**
   * Saves a new message to a specific room.
   * @param roomId The ID of the room where the message is sent.
   * @param userId The ID of the user sending the message.
   * @param content The message content.
   */
  async saveMessage(roomId: Types.ObjectId, userId: Types.ObjectId, content: string): Promise<IMessage> {
    const newMessage = new Message({ room: roomId, user: userId, content });
    await newMessage.save();
    return newMessage.populate('user', 'username');
  }

  /**
   * Retrieves message history for a specific room.
   * @param roomId The ID of the room.
   * @param limit The maximum number of messages to retrieve (default: 50).
   */
  async getRoomHistory(roomId: string | Types.ObjectId, limit: number = 50): Promise<IMessage[]> {
    return Message.find({ room: roomId })
      .populate('user', 'username') // Populate user data, only 'username' field
      .sort({ timestamp: 1 })
      .limit(limit)
      .exec();
  }
}

export const chatService = new ChatService();
