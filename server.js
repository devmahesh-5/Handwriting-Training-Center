
import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import connectDB from "./src/db/index.js";
import Whiteboard from "./src/models/whiteboard.models.js";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer((req, res) => {
        handle(req, res);
    });

    //  Socket.IO setup
    const io = new Server(server, {
        path: "/socketio", // custom path
        cors: {
            origin: "*", // adjust to your frontend domain in prod
        },
    });

    io.on("connection", (socket) => {
        console.log(" User connected:", socket.id);

        // join a whiteboard room
        socket.on("join-board", (boardId) => {
            socket.join(boardId);
            console.log(`User ${socket.id} joined board ${boardId}`);
        });

        // handle drawing events
        socket.on("drawing", async ({ boardId, stroke }) => {
            // broadcast to others in the same board
            socket.to(boardId).emit("drawing", stroke);

            // save stroke in DB
            await connectDB();
            await Whiteboard.findByIdAndUpdate(
                boardId,
                { $push: { drawing: stroke } },
                { new: true, upsert: true }
            );

        });


        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Next.js + Socket.IO running at http://localhost:${PORT}`);
    });
});


// join-call-room
socket.on("join-call-room", ({ roomId, userId }) => {
  socket.join(roomId);
  socket.userId = userId;

  // tell existing users about the new user
  socket.to(roomId).emit("user-joined", { userId });

  console.log(`${userId} joined ${roomId}`);
});

// offer/answer/candidate now broadcast to the room
socket.on("offer", ({ roomId, offer, from }) => {
  socket.to(roomId).emit("offer", { from, offer });
});

socket.on("answer", ({ roomId, answer, from }) => {
  socket.to(roomId).emit("answer", { from, answer });
});

socket.on("candidate", ({ roomId, candidate, from }) => {
  socket.to(roomId).emit("candidate", { from, candidate });
});

socket.on("disconnect", () => {
  if (socket.rooms) {
    for (const roomId of socket.rooms) {
      socket.to(roomId).emit("user-left", { userId: socket.userId });
    }
  }
});
