import { Request, Response } from 'express';

export const notFoundHandler = (_req: Request, res: Response) => {
  return res.status(404).json({
    status: 'error',
    message: 'Resource not found'
  });
}; 