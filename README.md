# Agent Monitor

A real-time monitoring system for tracking and managing software agents. This full-stack application provides a dashboard interface for monitoring agent status, activities, and performance metrics with real-time updates.

## Architecture

The project is structured as a modern full-stack application with:

- **Backend Server**: Node.js/TypeScript server with Express
  - MongoDB database integration
  - WebSocket support for real-time updates
  - JWT-based authentication
  - RESTful API endpoints

- **Frontend UI**: React/TypeScript application with Vite
  - Real-time dashboard interface
  - Component-based architecture
  - Modern responsive design

## Key Features

- Real-time agent monitoring via WebSocket connections
- User authentication and authorization
- Dashboard interface for agent management
- Agent status tracking and metrics
- Responsive web interface

## Project Structure

```
.
├── server/                 # Backend server
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── types/         # TypeScript type definitions
│   │   └── websocket/     # WebSocket handlers
│   └── package.json
│
├── ui/                    # Frontend application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   └── assets/        # Static assets
│   └── package.json
│
└── docker-compose.yml     # Docker composition file
```

## Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Docker and Docker Compose (for containerized setup)

### Local Development Setup

#### Server Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with required environment variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/agent-monitor
   JWT_SECRET=your-secret-key
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

#### UI Setup

1. Navigate to the UI directory:
   ```bash
   cd ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Docker Setup

The entire application stack can be run using Docker Compose, which includes:
- MongoDB database
- Backend API server
- Frontend UI application

1. Build and start all services:
   ```bash
   docker compose up --build
   ```

2. Access the applications:
   - Frontend UI: http://localhost:5173
   - Backend API: http://localhost:3000
   - MongoDB: localhost:27017

To stop all services:
```bash
docker compose down
```

To remove all data volumes:
```bash
docker compose down -v
```

## Development

When running locally:
- Server runs on `http://localhost:3000`
- UI development server runs on `http://localhost:5173`
- WebSocket server is available on `ws://localhost:3000`

## License

This project is licensed under the MIT License - see the LICENSE file for details.
