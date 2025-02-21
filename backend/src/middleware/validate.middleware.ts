import { Request, Response, NextFunction } from 'express';
import { validateUrl } from '../utils/validators';

export const validateUrlMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!validateUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  return next();
}; 