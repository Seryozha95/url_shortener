# URL Shortener

A modern URL shortening service built with React, Node.js, and PostgreSQL.

## Features

- 🔗 Create short URLs
- 👤 User authentication
- 📊 Track URL visits
- ✨ Custom URL slugs
- 🔒 Secure and scalable
- 🌐 RESTful API
- 📱 Responsive design

## Tech Stack

### Frontend
- React
- TypeScript
- React Router
- Axios

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication

## Running Locally

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Git

### Setup

1. Clone the repository
```bash
git clone <repository-url>
cd url-shortener
```

2. Start the services
```bash
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:4001
- Database: localhost:5432

### Manual Setup

If you prefer to run without Docker:

1. Setup Backend
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

2. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

## Environment Variables

### Backend
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/urlshortener?schema=public
NODE_ENV=development
PORT=4001
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=http://localhost:3000
```

### Frontend
```env
REACT_APP_API_URL=http://localhost:4001/api
```

## API Routes

### Public Routes
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /:slug` - Redirect to original URL
- `POST /api/urls/public` - Create short URL (anonymous)

### Protected Routes
- `GET /api/urls` - Get user's URLs
- `POST /api/urls` - Create short URL
- `PUT /api/urls/:id` - Update URL
- `DELETE /api/urls/:id` - Delete URL
