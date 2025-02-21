import { Router } from 'express';
import { UrlController } from '../controllers/url.controller';
import { validateUrlMiddleware } from '../middleware/validate.middleware';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/:slug', UrlController.redirectToUrl); // Redirect route
router.post('/public', validateUrlMiddleware, UrlController.createShortUrl); // Public URL creation

// Protected routes
router.use(authMiddleware); // Apply auth middleware to all routes below
router.post('/', validateUrlMiddleware, UrlController.createShortUrl); // Authenticated URL creation
router.get('/', UrlController.getUserUrls); // Changed from getAllUrls to getUserUrls
router.patch('/:id', UrlController.updateUrl);
router.delete('/:id', UrlController.deleteUrl);

export { router as urlRouter }; 