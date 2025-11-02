// backend/server.ts
import express, { Request, Response } from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "./prisma/connection";

const app = express();
const server = http.createServer(app);

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// ===== SOCKET.IO SETUP =====
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("✅ New user connected:", socket.id);

  socket.on("chat message", (data) => {
    console.log("💬 Message received:", data);
    io.emit("chat message", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ===== ROOT ROUTE =====
app.get("/", (_req: Request, res: Response) => {
  res.send("✅ Hello from NexTalk backend (TypeScript + Prisma + Socket.io)!");
});

// ===== AUTH ROUTES =====

// 🟢 REGISTER
app.post("/api/auth/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    res.status(201).json({
      message: "User created successfully",
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err: any) {
    console.error("❌ Register error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// 🟢 LOGIN
app.post("/api/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password)
      return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "defaultsecret",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err: any) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// 🟢 GET ALL USERS (for chat contacts)
app.get("/api/users", async (_req: Request, res: Response) => {
  try {
    // Only return safe info (no passwords)
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
    });
    res.status(200).json(users);
  } catch (err: any) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 TypeScript server running on http://localhost:${PORT}`);
});
