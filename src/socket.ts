import { Server as IOServer } from 'socket.io';
import { chatService } from './services/chatService';
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData, ChatSocket } from './types/socket';
import { CORS_ORIGIN } from './config';

export const initSocketIO = (httpServer: any) => {
  const io = new IOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
    cors: {
      origin: CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true
    },
  });

  io.on('connection', (socket: ChatSocket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('room:join', async (payload, callback) => {
      const { roomId, username } = payload;
      try {
        const room = await chatService.findRoomById(roomId);
        if (!room) {
          console.warn(`Room with ID ${roomId} not found.`);
          socket.emit('room:error', 'Room not found.');
          if (callback) callback({ success: false, error: 'Room not found' });
          return;
        }

        const user = await chatService.findOrCreateUser(username);

        // Store user info in socket data
        socket.data.userId = user._id.toString();
        socket.data.username = user.username;
        socket.data.activeRoomId = roomId;

        await socket.join(roomId);
        console.log(`User ${username} (${socket.id}) joined room: ${room.name} (${roomId})`);

        // Emit to current client that they joined the room
        socket.emit('room:joined', { roomId, roomName: room.name, userId: user._id.toString(), username: user.username });

        // Fetch and send history to the newly joined user
        const history = await chatService.getRoomHistory(roomId);
        const formattedHistory = history.map(msg => ({
          user: { _id: msg.user._id.toString(), username: (msg.user as any).username },
          content: msg.content,
          timestamp: msg.timestamp,
          roomId: msg.room.toString()
        }));
        socket.emit('room:history', formattedHistory);

        // Notify others in the room (optional, for 'user joined' messages)
        // socket.to(roomId).emit('room:message', { user: { _id: 'server', username: 'Server' }, content: `${username} joined the room.`, timestamp: new Date(), roomId });

        if (callback) callback({ success: true });

      } catch (error: any) {
        console.error(`Error joining room ${roomId}:`, error.message);
        socket.emit('room:error', `Failed to join room: ${error.message}`);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    socket.on('room:message', async (payload) => {
      const { roomId, userId, content } = payload;
      try {
        if (!socket.data.activeRoomId || socket.data.activeRoomId !== roomId) {
            console.warn(`User ${socket.data.username} tried to send message to room ${roomId} but is not active in it.`);
            socket.emit('room:error', 'You are not active in this room.');
            return;
        }

        const message = await chatService.saveMessage(new (require('mongoose')).Types.ObjectId(roomId), new (require('mongoose')).Types.ObjectId(userId), content);
        const formattedMessage = {
          user: { _id: message.user._id.toString(), username: (message.user as any).username },
          content: message.content,
          timestamp: message.timestamp,
          roomId: message.room.toString()
        };

        io.to(roomId).emit('room:message', formattedMessage);
        console.log(`Message from ${formattedMessage.user.username} in ${roomId}: ${content}`);
      } catch (error: any) {
        console.error(`Error saving message in room ${roomId}:`, error.message);
        socket.emit('room:error', `Failed to send message: ${error.message}`);
      }
    });

    socket.on('room:leave', (payload) => {
      const { roomId, userId } = payload;
      socket.leave(roomId);
      socket.data.activeRoomId = undefined;
      console.log(`User ${userId} left room: ${roomId}`);
      // Optionally, notify others in the room
      // socket.to(roomId).emit('room:message', { user: { _id: 'server', username: 'Server' }, content: `${socket.data.username || userId} left the room.`, timestamp: new Date(), roomId });
    });

    socket.on('room:create', async (roomName, callback) => {
      try {
        const newRoom = await chatService.createRoom(roomName);
        const roomData = { _id: newRoom._id.toString(), name: newRoom.name };
        io.emit('server:rooms', await chatService.getAllRooms()); // Notify all clients about new room list
        console.log(`New room created: ${roomName} (${newRoom._id})`);
        if (callback) callback({ success: true, room: roomData });
      } catch (error: any) {
        console.error(`Error creating room ${roomName}:`, error.message);
        socket.emit('room:error', `Failed to create room: ${error.message}`);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    socket.on('room:getHistory', async (payload) => {
      const { roomId } = payload;
      try {
        const history = await chatService.getRoomHistory(roomId);
        const formattedHistory = history.map(msg => ({
          user: { _id: msg.user._id.toString(), username: (msg.user as any).username },
          content: msg.content,
          timestamp: msg.timestamp,
          roomId: msg.room.toString()
        }));
        socket.emit('room:history', formattedHistory);
      } catch (error: any) {
        console.error(`Error fetching history for room ${roomId}:`, error.message);
        socket.emit('room:error', `Failed to get room history: ${error.message}`);
      }
    });

    socket.on('room:getRooms', async () => {
      try {
        const rooms = await chatService.getAllRooms();
        const formattedRooms = rooms.map(room => ({ _id: room._id.toString(), name: room.name }));
        socket.emit('server:rooms', formattedRooms);
      } catch (error: any) {
        console.error('Error fetching rooms:', error.message);
        socket.emit('room:error', `Failed to get rooms: ${error.message}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      if (socket.data.activeRoomId) {
        // Optionally, notify room members that a user left
        // io.to(socket.data.activeRoomId).emit('room:message', { user: { _id: 'server', username: 'Server' }, content: `${socket.data.username || 'A user'} disconnected.`, timestamp: new Date(), roomId: socket.data.activeRoomId });
      }
    });
  });

  return io;
};
