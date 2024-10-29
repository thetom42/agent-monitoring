# Agent Monitor Server

Backend server for the Agent Monitor application providing WebSocket connections, REST API endpoints, authentication, and database integration.

## Features

- Real-time agent monitoring via WebSocket
- RESTful API for agent management
- JWT-based authentication
- MongoDB integration for data persistence
- TypeScript support
- Express.js server

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (for database)
- npm or yarn package manager

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   Create a `.env` file in the root directory with the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
```

To get your MongoDB Atlas connection string:
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Click "Connect" and choose "Connect your application"
4. Copy the connection string and replace `<password>` with your database user password

## Development

Run the server in development mode with hot reloading:
```bash
npm run dev
```

## Production

Build the TypeScript code:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user

### Agents
- GET `/api/agents` - Get all agents
- POST `/api/agents` - Create new agent (admin only)
- GET `/api/agents/:id` - Get single agent
- PUT `/api/agents/:id` - Update agent (admin only)
- DELETE `/api/agents/:id` - Delete agent (admin only)

### WebSocket Events
- `agent:heartbeat` - Receive agent status updates
- `agent:updated` - Broadcast agent updates to clients

## Security

- JWT-based authentication
- Protected routes with role-based access control
- Request validation using express-validator
- CORS enabled for specified origins
- Password hashing using bcrypt

## Error Handling

The server includes comprehensive error handling:
- Validation errors
- Authentication errors
- Database errors
- 404 Not Found
- 500 Internal Server Error

## Project Structure

```
src/
├── config/         # Configuration files
├── models/         # Database models
├── routes/         # API routes
├── middleware/     # Custom middleware
├── websocket/      # WebSocket handlers
├── types/          # TypeScript type definitions
└── server.ts       # Main application file
