import { Router } from 'express';
import { chatService } from '../services/chatService';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const rooms = await chatService.getAllRooms();
    res.json(rooms.map(room => ({ _id: room._id.toString(), name: room.name })));
  } catch (error: any) {
    console.error('Error fetching rooms:', error.message);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Room name is required' });
  }

  try {
    const newRoom = await chatService.createRoom(name);
    res.status(201).json({ _id: newRoom._id.toString(), name: newRoom.name });
  } catch (error: any) {
    console.error('Error creating room:', error.message);
    if (error.code === 11000) { // Duplicate key error
        return res.status(409).json({ error: 'Room with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to create room' });
  }
});

export default router;
