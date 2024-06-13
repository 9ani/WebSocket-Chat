import { Router } from 'express';
import authRouter from './auth/auth-router';
import { getChatById } from './chat/chat-controller';
import AuthService from './auth/auth-service'; // Import AuthService
import AuthController from './auth/auth-controller';

const globalRouter = Router();
const authService = new AuthService(); // Create an instance of AuthService
const authController = new AuthController(authService); // Pass authService to the AuthController constructor

globalRouter.use(authRouter);

globalRouter.get('/chats/:id', getChatById);
// globalRouter.get('/users', authController.getAllUsers);

export default globalRouter;
