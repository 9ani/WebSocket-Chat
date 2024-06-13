import { Request, Response } from 'express';
import { CreateUserDto } from './dtos/CreateUser.dto';
import AuthService from './auth-service';
import RefreshTokenModel from './models/RefreshToken';
import UserModel from './models/User';

class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const createUserDto: CreateUserDto = req.body;
      const user = await this.authService.registerUser(createUserDto);
      res.status(201).json(user);
    } catch (err) {
      console.error('Error registering user:', err);
      res.status(500).json({ message: 'Error registering user' });
    }
  }

  loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      console.log(`Login request received for email: ${email}`);
      const result = await this.authService.loginUser(email, password);
      if (!result) {
        console.log('Invalid email or password');
        res.status(401).json({ message: 'Invalid email or password' });
        return;
      }
      res.status(200).json(result);
    } catch (err) {
      console.error('Error logging in:', err);
      res.status(500).json({ message: 'Error logging in' });
    }
  }

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;
      const result = await this.authService.refreshToken(token);
      if (!result) {
        res.status(401).json({ message: 'Invalid or expired refresh token' });
        return;
      }
      res.status(200).json(result);
    } catch (err) {
      console.error('Error refreshing token:', err);
      res.status(500).json({ message: 'Error refreshing token' });
    }
  }

  logoutUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      await RefreshTokenModel.deleteOne({ token });
      res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
      res.status(500).json({ message: 'Error logging out' });
    }
  }

  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await UserModel.find({});
      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Error fetching users' });
    }
  };
}

export default AuthController;
