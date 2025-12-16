import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { auth } from "./auth";
import { toNodeHandler } from "better-auth/node";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration (must be before routes)
// Allow requests from Vercel frontend and local development
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://physical-ai-book1-inky.vercel.app',
  'https://physical-ai-book1-muhammad-faizans-projects-c907627a.vercel.app',
  // Allow all Vercel preview deployments
  /^https:\/\/physical-ai-book1-.*\.vercel\.app$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if origin matches allowed origins
      const isAllowed = allowedOrigins.some(allowed => {
        if (typeof allowed === 'string') {
          return allowed === origin;
        }
        // Handle regex patterns
        return allowed.test(origin);
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  })
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "Physical AI Auth Server",
  });
});

// Mount BetterAuth handlers BEFORE express.json() middleware
// All auth routes will be under /api/auth/*
app.all("/api/auth/*", toNodeHandler(auth));

// Mount express.json() AFTER Better Auth handler
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    path: req.path,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Authentication server running on http://localhost:${PORT}`);
  console.log(`📡 Auth endpoints available at http://localhost:${PORT}/api/auth`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`\n🔐 Enabled OAuth providers:`);
  if (process.env.GOOGLE_CLIENT_ID) console.log("  ✓ Google");
  if (process.env.GITHUB_CLIENT_ID) console.log("  ✓ GitHub");
  console.log(`\n⚙️  Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  process.exit(0);
});
