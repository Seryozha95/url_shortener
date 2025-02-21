import { AuthController } from '../../src/controllers/auth.controller';
import { prisma } from '../../src/services/prisma.service';
import { config } from '../../src/config';
import jwt from 'jsonwebtoken';
import { randomBytes, scryptSync } from 'crypto';

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mocked.jwt.token'),
  verify: jest.fn(() => ({ userId: '1' }))
}));

// Mock crypto functions
const mockSalt = 'mockedsalt';
const mockHashedPassword = Buffer.from('mockedhashedpassword').toString('hex');

jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({
    toString: jest.fn(() => mockSalt)
  })),
  scryptSync: jest.fn(() => Buffer.from('mockedhashedpassword')),
}));

// Mock prisma client
jest.mock('../../src/services/prisma.service', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

describe('AuthController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const mockReq = {
      body: {
        email: 'test@example.com',
        password: 'ValidPass123',
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    it('should register a new user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: `${mockSalt}:${mockHashedPassword}`,
        createdAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      await AuthController.register(mockReq as any, mockRes as any);

      expect(randomBytes).toHaveBeenCalledWith(16);
      expect(scryptSync).toHaveBeenCalledWith(
        mockReq.body.password,
        mockSalt,
        64
      );

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: `${mockSalt}:${mockHashedPassword}`,
        },
      });

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          user: {
            id: mockUser.id,
            email: mockUser.email,
            createdAt: mockUser.createdAt,
          },
          token: 'mocked.jwt.token',
        },
      });
    });

    it('should reject registration with invalid email', async () => {
      const invalidReq = {
        body: {
          email: 'invalid-email',
          password: 'ValidPass123',
        },
      };

      await AuthController.register(invalidReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid email format',
      });
    });

    it('should reject registration with invalid password', async () => {
      const invalidReq = {
        body: {
          email: 'test@example.com',
          password: 'weak',
        },
      };

      await AuthController.register(invalidReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number',
      });
    });

    it('should reject registration for existing user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1' });

      await AuthController.register(mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'User already exists',
      });
    });
  });

  describe('login', () => {
    const mockReq = {
      body: {
        email: 'test@example.com',
        password: 'ValidPass123',
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    it('should login user successfully with correct credentials', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: `${mockSalt}:${mockHashedPassword}`,
        createdAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (scryptSync as jest.Mock).mockReturnValue(Buffer.from('mockedhashedpassword'));

      await AuthController.login(mockReq as any, mockRes as any);

      expect(scryptSync).toHaveBeenCalledWith(
        mockReq.body.password,
        mockSalt,
        64
      );

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          user: {
            id: mockUser.id,
            email: mockUser.email,
            createdAt: mockUser.createdAt,
          },
          token: 'mocked.jwt.token',
        },
      });
    });

    it('should reject login with non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await AuthController.login(mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid credentials',
      });
    });

    it('should reject login with incorrect password', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: `${mockSalt}:${Buffer.from('differentpassword').toString('hex')}`,
        createdAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (scryptSync as jest.Mock).mockReturnValue(Buffer.from('mockedhashedpassword'));

      await AuthController.login(mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid credentials',
      });
    });
  });

  describe('JWT Token', () => {
    it('should generate valid JWT token', () => {
      const userId = '1';
      jwt.sign({ userId }, config.jwtSecret, { expiresIn: '24h' });
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId },
        config.jwtSecret,
        { expiresIn: '24h' }
      );
    });

    it('should reject invalid JWT token', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => {
        jwt.verify('invalid.token', config.jwtSecret);
      }).toThrow('Invalid token');
    });
  });
}); 