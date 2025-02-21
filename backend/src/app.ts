import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { urlRouter } from './routes/url.routes';
import { authRouter } from './routes/auth.routes';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/notFound.middleware';
import { config } from './config';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api/auth', authRouter); // Auth routes
app.use('/api/urls', urlRouter); // API routes
app.get('/:slug', urlRouter); // Redirect route

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export { app }; 