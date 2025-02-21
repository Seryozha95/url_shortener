import { authMiddleware } from '../../src/middleware/auth.middleware';
import jwt from 'jsonwebtoken';
import { config } from '../../src/config';
import { Request, Response, NextFunction } from 'express';

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

describe('Auth Middleware', () => {
  const mockReq = {
    headers: {
      authorization: undefined
    }
  } as Request;

  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  const mockNext = jest.fn() as NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset request headers and mocks
    mockReq.headers.authorization = undefined;
    (jwt.verify as jest.Mock).mockReset();
  });

  it('should authenticate valid token and set userId', () => {
    const token = 'valid.jwt.token';
    const userId = '123';
    mockReq.headers.authorization = `Bearer ${token}`;
    (jwt.verify as jest.Mock).mockReturnValue({ userId });

    authMiddleware(mockReq, mockRes, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith(token, config.jwtSecret);
    expect(mockReq.userId).toBe(userId);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should reject request without authorization header', () => {
    mockReq.headers.authorization = undefined;

    authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Authentication required'
    });
    expect(mockNext).not.toHaveBeenCalled();
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  it('should reject request with invalid authorization format', () => {
    mockReq.headers.authorization = 'InvalidFormat token';

    authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Authentication required'
    });
    expect(mockNext).not.toHaveBeenCalled();
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  it('should reject request with invalid token', () => {
    mockReq.headers.authorization = 'Bearer invalid.token';
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Invalid or expired token'
    });
    expect(mockNext).not.toHaveBeenCalled();
    expect(jwt.verify).toHaveBeenCalledWith('invalid.token', config.jwtSecret);
  });
}); 