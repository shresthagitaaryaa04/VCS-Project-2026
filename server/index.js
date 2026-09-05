import express from 'express';
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';

import cors from "cors";

import { connectDB } from "./db/connectDB.js"
import authRoutes from './routes/auth.route.js'
import userRoutes from './routes/user.route.js'
import trailRoutes from './routes/trailRoutes.js'
import chatRoutes from './routes/chat.route.js'
import friendRoutes from './routes/friend.route.js'
import groupRoutes from './routes/group.route.js'
import { initializeSocket } from './socket/socketHandler.js';
import recommendationRoutes from './routes/recommendation.route.js'
import { deleteExpiredGroups } from './controllers/group.controller.js';

dotenv.config();
const app = express();
const httpServer = createServer(app);

app.set("trust proxy", 1);

const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, "") : "";

const allowedOrigins = [
  clientUrl,
  "https://trek-sathi-nine.vercel.app",
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:3000",
].filter(Boolean);

const corsOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);
  const cleanOrigin = origin.replace(/\/$/, "");
  if (
    allowedOrigins.includes(cleanOrigin) ||
    cleanOrigin.endsWith(".vercel.app") ||
    cleanOrigin.includes("localhost") ||
    cleanOrigin.includes("127.0.0.1")
  ) {
    return callback(null, true);
  }
  return callback(null, true);
};

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    credentials: true
  }
});

// Make io accessible in controllers via req.app.get('io')
app.set("io", io);

const PORT = process.env.PORT || 5000;

app.use(cors({ origin: corsOrigin, credentials: true }));

app.get("/", (req, res) => {
  res.json({ ok: true, service: "trek-sathi-api" });
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use(express.json()); //allows to parse incoming request :req.body
app.use(cookieParser()); //to parse cookies from request

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

console.log('Setting up API routes...');
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/trails", trailRoutes);
app.use("/api/chat", chatRoutes);
console.log('Chat routes mounted at /api/chat');
app.use("/api/friends", friendRoutes);
console.log('Friend routes mounted at /api/friends');
app.use("/api/groups", groupRoutes);
console.log('Group routes mounted at /api/groups');
app.use("/api/recommendations", recommendationRoutes);
console.log('Recommendation routes mounted at /api/recommendations');

// app.listen(PORT, () => {
//   connectDB()
//   console.log(`Example app listening on port ${PORT}`)
// })

const startServer = async () => {
  try {
    await connectDB();

    // Initialize Socket.IO
    initializeSocket(io);
    console.log('Socket.IO initialized');

    // Clean up expired groups on boot and schedule periodic cleanup (every 30 mins)
    await deleteExpiredGroups();
    setInterval(deleteExpiredGroups, 30 * 60 * 1000);

    httpServer.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`)
      console.log(`Socket.IO ready for connections`)
    })
  } catch (error) {
    console.log("Failed to start server:", error)
    process.exit(1)
  }
}
startServer()

// Handle server errors such as EADDRINUSE gracefully
httpServer.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    const nextPort = Number(PORT) + 1;
    console.warn(`Port ${PORT} in use, attempting to listen on ${nextPort}`);
    httpServer.listen(nextPort, () => {
      console.log(`Server listening on port ${nextPort}`);
    });
  } else {
    console.error('HTTP server error:', err);
    process.exit(1);
  }
});