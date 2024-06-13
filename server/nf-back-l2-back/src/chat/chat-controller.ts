import { Request, Response } from 'express';
import { chatModel } from '../models/chat';

export const getChatById = async (req: Request, res: Response): Promise<void> => {
  try {
    const chatId = req.params.id;
    const chat = await chatModel.findById(chatId);
    if (!chat) {
      res.status(404).json({ message: 'Chat not found' });
      return;
    }
    res.status(200).json(chat);
  } catch (err) {
    console.error('Error fetching chat:', err);
    res.status(500).json({ message: 'Error fetching chat' });
  }
};
