// backend/server.js
const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("./prisma/connection").default;

const app = express();
const server = http.createServer(app);

// ===== ENVIRONMENT VARIABLES =====
const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret";
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(
  cors({
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ===== SOCKET.IO SETUP =====
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Track connected users
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // User joins with their userId
  socket.on("join", ({ userId }) => {
    if (userId) {
      connectedUsers.set(userId, socket.id);
      console.log(`User ${userId} joined with socket ${socket.id}`);
    }
  });

  // Handle chat message
  socket.on("chat message", async (data) => {
    try {
      const { senderId, receiverId, content } = data;

      if (!senderId || !receiverId || !content) {
        console.error("Missing required fields:", {
          senderId,
          receiverId,
          content,
        });
        return;
      }

      const chat = await getOrCreateChat(senderId, receiverId);

      const newMessage = await prisma.message.create({
        data: {
          chatId: chat.id,
          senderId: senderId.toString(),
          content: content.trim(),
        },
      });

      console.log("Message saved:", newMessage.id);

      // Emit to specific receiver if online, otherwise broadcast to all
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
        console.log(`Message sent to receiver ${receiverId}`);
      } else {
        console.log(`Receiver ${receiverId} is offline`);
      }

      // Also emit to sender for confirmation
      socket.emit("newMessage", newMessage);
    } catch (err) {
      console.error("Socket message save error:", err);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("disconnect", () => {
    // Remove user from connected users
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
    console.log("Socket disconnected:", socket.id);
  });
});

// ===== HELPER FUNCTIONS =====
async function getOrCreateChat(userAId, userBId) {
  try {
    // Ensure IDs are strings
    const idA = userAId.toString();
    const idB = userBId.toString();

    // Find existing chat
    let chat = await prisma.chat.findFirst({
      where: {
        userIds: {
          hasEvery: [idA, idB],
        },
      },
    });

    // Create new chat if doesn't exist
    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          userIds: [idA, idB],
        },
      });
      console.log(`New chat created between ${idA} and ${idB}`);
    }

    return chat;
  } catch (err) {
    console.error("Error in getOrCreateChat:", err);
    throw err;
  }
}

// ===== ROOT ROUTE =====
app.get("/", (_req, res) => {
  res.json({
    message: "NexTalk Backend is running!",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
      },
      users: "GET /api/users",
      messages: {
        get: "GET /api/messages?userAId=&userBId=",
        post: "POST /api/messages",
      },
    },
  });
});

// ===== AUTH ROUTES =====

/**
 * Register a new user
 */
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({
      error: "All fields are required",
      message: "Please provide name, email, and password",
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: "Invalid email format",
      message: "Please provide a valid email address",
    });
  }

  // Password validation
  if (password.length < 6) {
    return res.status(400).json({
      error: "Password too short",
      message: "Password must be at least 6 characters long",
    });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "Email already registered",
        message: "This email is already in use. Please sign in instead.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with image field
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        image: "",
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });

    console.log("New user registered:", user.email);

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({
      error: "Server error",
      message:
        "An error occurred while creating your account. Please try again.",
    });
  }
});

/**
 * Login user
 */
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      error: "Missing credentials",
      message: "Please provide both email and password",
    });
  }

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        image: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        message: "No account found with this email",
      });
    }

    if (!user.password) {
      return res.status(401).json({
        error: "Invalid login method",
        message: "Please sign in with Google or GitHub",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "Incorrect password",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("User logged in:", user.email);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      error: "Server error",
      message: "An error occurred while signing in. Please try again.",
    });
  }
});

// ===== USERS ROUTE =====

/**
 * Get all users (excluding passwords)
 */
app.get("/api/users", async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`Fetched ${users.length} users`);
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({
      error: "Failed to fetch users",
      message: "Could not retrieve users. Please try again.",
    });
  }
});

/**
 * Get a specific user by ID
 */
app.get("/api/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        message: "No user found with this ID",
      });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({
      error: "Failed to fetch user",
      message: "Could not retrieve user information",
    });
  }
});

// ===== MESSAGES ROUTES =====
app.get("/api/messages", async (req, res) => {
  const { userAId, userBId } = req.query;

  if (!userAId || !userBId) {
    return res.status(400).json({
      error: "Missing parameters",
      message: "Both userAId and userBId are required",
    });
  }

  try {
    // Ensure IDs are strings
    const idA = userAId.toString();
    const idB = userBId.toString();

    // Find chat between users
    let chat = await prisma.chat.findFirst({
      where: {
        userIds: { hasEvery: [idA, idB] },
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // Create new chat if doesn't exist
    if (!chat) {
      console.log(
        `No existing chat found — creating new one between ${idA} and ${idB}`
      );
      chat = await prisma.chat.create({
        data: { userIds: [idA, idB] },
        include: { messages: true },
      });
    }

    console.log(`Fetched ${chat.messages.length} messages`);
    res.json(chat.messages || []);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({
      error: "Failed to fetch messages",
      message: "Could not retrieve conversation. Please try again.",
    });
  }
});

/**
 * Send a new message
 */
app.post("/api/messages", async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    // Validation
    if (!senderId || !receiverId || !content) {
      return res.status(400).json({
        error: "Missing fields",
        message: "senderId, receiverId, and content are required",
      });
    }

    if (!content.trim()) {
      return res.status(400).json({
        error: "Empty message",
        message: "Message content cannot be empty",
      });
    }

    // Get or create chat
    const chat = await getOrCreateChat(senderId, receiverId);

    // Create message
    const message = await prisma.message.create({
      data: {
        chatId: chat.id,
        senderId: senderId.toString(),
        content: content.trim(),
      },
    });

    console.log("Message created:", message.id);

    // Emit to socket
    io.emit("newMessage", message);

    res.status(201).json(message);
  } catch (err) {
    console.error("Error creating message:", err);
    res.status(500).json({
      error: "Failed to send message",
      message: "Could not send your message. Please try again.",
    });
  }
});

// ===== ERROR HANDLING MIDDLEWARE =====
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: "Something went wrong on our end",
  });
});

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// ===== START SERVER =====
server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`Socket.IO ready for connections from ${CLIENT_URL}`);
  console.log(
    `JWT Secret: ${
      JWT_SECRET === "defaultsecret"
        ? "Using default (not secure!)"
        : "Custom secret set"
    }`
  );
});

// ===== GRACEFUL SHUTDOWN =====
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    prisma.$disconnect();
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("👋 SIGINT received, shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    prisma.$disconnect();
    process.exit(0);
  });
});
