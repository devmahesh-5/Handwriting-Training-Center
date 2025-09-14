// server.js
import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import connectDB from "./src/db/index.js";
import Whiteboard from "./src/models/whiteboard.models.js";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  // connect to DB once
  try {
    await connectDB();
    console.log("✅ DB connected");
  } catch (err) {
    console.error("DB connection failed:", err);
  }

  const server = createServer((req, res) => {
    handle(req, res);
  });

  // Socket.IO server on port 4000 (path /socketio)
  const io = new Server(server, {
    path: "/socketio",
    cors: {
      origin: ["https://handwriting-training-center.vercel.app/"], // adjust as needed
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    // ================= WHITEBOARD =================
    socket.on("join-board", (boardId) => {
      socket.join(boardId);
      console.log(`${socket.id} joined board ${boardId}`);
    });

    // persist stroke and broadcast to room
    socket.on("drawing", async ({ boardId, stroke }) => {
      try {
        socket.to(boardId).emit("drawing", stroke);
        // persist
        if (boardId) {
          await Whiteboard.findByIdAndUpdate(
            boardId,
            { $push: { drawing: stroke } },
            { new: true, upsert: true }
          );
        }
      } catch (err) {
        console.error("Drawing DB error:", err?.message || err);
      }
    });

    socket.on("clear-board", async ({ boardId }) => {
      try {
        socket.to(boardId).emit("clear-board");
        if (boardId) {
          await Whiteboard.findByIdAndUpdate(boardId, { $set: { drawing: [] } });
        }
      } catch (err) {
        console.error("Clear board error:", err?.message || err);
      }
    });

    // ================= VIDEO CALL (SIGNALING) =================
    // When a client joins a call-room we send them existing participants and
    // notify others about the newcomer.
    socket.on("join-call-room", ({ roomId }) => {
      socket.join(roomId);
      socket.roomId = roomId;
      console.log(`→ ${socket.id} joined call room ${roomId}`);

      // gather current clients in the room (excluding the joining socket)
      const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []).filter(
        (id) => id !== socket.id
      );

      // send the list of existing clients to the joining socket
      socket.emit("all-users", { users: clients });

      // tell others that a new user has joined (they should createOffer -> new user)
      socket.to(roomId).emit("user-joined", { socketId: socket.id });
    });

    // Offer: from -> to (single target)
    socket.on("offer", ({ to, offer, from }) => {
      // forward offer to a single client
      if (to) {
        io.to(to).emit("offer", { from: from || socket.id, offer });
      }
    });

    // Answer: from -> to
    socket.on("answer", ({ to, answer, from }) => {
      if (to) {
        io.to(to).emit("answer", { from: from || socket.id, answer });
      }
    });

    // ICE candidate
    socket.on("ice-candidate", ({ to, candidate, from }) => {
      if (to) {
        io.to(to).emit("ice-candidate", { from: from || socket.id, candidate });
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
      const roomId = socket.roomId;
      if (roomId) {
        socket.to(roomId).emit("user-left", { socketId: socket.id });
      }
    });
  });

  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => {
    console.log(` Server running at https://handwriting-training-center.vercel.app:${PORT}`);
  });
});
