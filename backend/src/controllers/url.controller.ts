import { Request, Response } from 'express';
import { UrlService } from '../services/url.service';
import { validateUrl } from '../utils/validators';

export class UrlController {
  static async createShortUrl(req: Request, res: Response) {
    try {
      const { url, customSlug } = req.body;

      if (!validateUrl(url)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid URL provided'
        });
      }

      const userId = req.userId || undefined;

      const shortUrl = await UrlService.createShortUrl(url, customSlug, userId);
      return res.status(201).json({
        status: 'success',
        data: shortUrl
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Custom slug already taken') {
        return res.status(400).json({
          status: 'error',
          message: 'Custom slug is already taken'
        });
      }
      console.error('Error creating short URL:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to create short URL'
      });
    }
  }

  static async redirectToUrl(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const url = await UrlService.getUrlBySlug(slug);

      if (!url) {
        return res.status(404).json({
          status: 'error',
          message: 'URL not found'
        });
      }

      await UrlService.trackVisit(
        url.id,
        req.ip,
        req.headers['user-agent']
      );

      return res.redirect(url.originalUrl);
    } catch (error) {
      console.error('Error redirecting to URL:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to redirect to URL'
      });
    }
  }

  static async getUserUrls(req: Request, res: Response) {
    try {
      const urls = await UrlService.getUserUrls(req.userId!);
      return res.json({
        status: 'success',
        data: urls
      });
    } catch (error) {
      console.error('Error fetching user URLs:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch URLs'
      });
    }
  }

  static async updateUrl(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { customSlug } = req.body;

      if (!customSlug) {
        return res.status(400).json({
          status: 'error',
          message: 'Custom slug is required'
        });
      }

      const url = await UrlService.updateUrl(id, req.userId!, { customSlug });
      return res.json({
        status: 'success',
        data: url
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Custom slug already taken') {
        return res.status(400).json({
          status: 'error',
          message: 'Custom slug is already taken'
        });
      }
      console.error('Error updating URL:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to update URL'
      });
    }
  }

  static async deleteUrl(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await UrlService.deleteUrl(id, req.userId!);
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting URL:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to delete URL'
      });
    }
  }
} 