import { Request, Response } from 'express';
import { randomBytes, scryptSync } from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../services/prisma.service';
import { config } from '../config';
import { validateEmail, validatePassword } from '../utils/validators';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Email and password are required'
        });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid email format'
        });
      }

      if (!validatePassword(password)) {
        return res.status(400).json({
          status: 'error',
          message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
        });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'User already exists'
        });
      }

      // Hash password
      const salt = randomBytes(16).toString('hex');
      const hashedPassword = scryptSync(password, salt, 64).toString('hex');
      const passwordHash = `${salt}:${hashedPassword}`;

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: passwordHash
        }
      });

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id },
        config.jwtSecret,
        { expiresIn: '24h' }
      );

      // Return user data (excluding password) and token
      return res.status(201).json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            email: user.email,
            createdAt: user.createdAt
          },
          token
        }
      });
    } catch (error) {
      console.error('Error registering user:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to register user'
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Email and password are required'
        });
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        });
      }

      // Verify password
      const [salt, storedHash] = user.password.split(':');
      const hashedPassword = scryptSync(password, salt, 64).toString('hex');
      const isValidPassword = storedHash === hashedPassword;

      if (!isValidPassword) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        });
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id },
        config.jwtSecret,
        { expiresIn: '24h' }
      );

      // Return user data (excluding password) and token
      return res.json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            email: user.email,
            createdAt: user.createdAt
          },
          token
        }
      });
    } catch (error) {
      console.error('Error logging in:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to login'
      });
    }
  }
} 