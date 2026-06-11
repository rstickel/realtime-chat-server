import { Socket as IOSocket } from 'socket.io';

export interface ServerToClientEvents {
  'room:message': (payload: { user: { _id: string; username: string }; content: string; timestamp: Date; roomId: string }) => void;
  'room:history': (messages: { user: { _id: string; username: string }; content: string; timestamp: Date; roomId: string }[]) => void;
  'room:joined': (payload: { roomId: string; roomName: string; userId: string; username: string }) => void;
  'room:error': (message: string) => void;
  'server:rooms': (rooms: { _id: string; name: string }[]) => void;
}

export interface ClientToServerEvents {
  'room:join': (payload: { roomId: string; username: string }, callback?: (response: { success: boolean; error?: string }) => void) => void;
  'room:message': (payload: { roomId: string; userId: string; content: string }) => void;
  'room:leave': (payload: { roomId: string; userId: string }) => void;
  'room:create': (roomName: string, callback?: (response: { success: boolean; room?: { _id: string; name: string }; error?: string }) => void) => void;
  'room:getHistory': (payload: { roomId: string }) => void;
  'room:getRooms': () => void;
}

export interface InterServerEvents {}

export interface SocketData {
  userId: string;
  username: string;
  activeRoomId?: string;
}

export type ChatSocket = IOSocket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
