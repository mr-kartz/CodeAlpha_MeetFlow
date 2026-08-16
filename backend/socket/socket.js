const rooms = {};

const socketHandler = (io) => {

  io.on("connection", (socket) => {

    console.log("🟢 User Connected:", socket.id);

    // ==========================================
    // Store current user info
    // ==========================================

    let currentRoomId = null;
    let currentPeerId = null;
    let currentUserName = null;

    // ==========================================
    // Join Room
    // ==========================================

    socket.on("join-room", ({ roomId, peerId, name }) => {

      console.log("JOIN EVENT:", {
    socketId: socket.id,
      roomId,
      peerId,
      name,
    });

      currentRoomId = roomId;
      currentPeerId = peerId;
      currentUserName = name;

      socket.join(roomId);

    console.log(
    "🏠 Socket joined room:",
    roomId,
    "Socket:",
    socket.id
    );

// ==========================================
// Check if meeting is locked
// ==========================================

if (
  rooms[roomId] &&
  rooms[roomId].locked
) {

  console.log(
    `🔒 ${name} tried to join locked room ${roomId}`
  );

  socket.emit("meeting-locked");

  socket.leave(roomId);

  return;
}

      if (!rooms[roomId]) {

        rooms[roomId] = {
          host: socket.id,
          users: [],
          locked: false,
        };

      }

// ==========================================
// Prevent Joining Locked Meeting
// ==========================================

if (rooms[roomId].locked) {

  console.log(
    `🔒 Join rejected - Room ${roomId} is locked`
  );

  socket.emit("meeting-locked");

  return;
}

      // Prevent duplicate users
      const alreadyExists = rooms[roomId].users.find(
        (user) => user.socketId === socket.id
      );

      if (!alreadyExists) {

        rooms[roomId].users.push({
          socketId: socket.id,
          peerId,
          name,
        });

      }

      console.log(`${name} joined ${roomId}`);

      socket.emit("room-joined", {
      roomId,
      });

      // Send host status
      socket.emit("host-status", {
        isHost: rooms[roomId].host === socket.id,
      });

      // Send existing participants
    socket.emit(
    "existing-participants",
    rooms[roomId].users
      .filter(
             (user) => user.socketId !== socket.id
          )
      .map((user) => ({
         ...user,
      isHost:
         user.socketId === rooms[roomId].host,
    }))
);

      // Notify others
      socket.to(roomId).emit(
        "user-connected",
        {
          peerId,
          name,
          socketId: socket.id,
          isHost: socket.id === rooms[roomId].host,
        }
      );

    });

    // ==========================================
    // Chat
    // ==========================================

   socket.on("send-message", (data) => {

  console.log("📨 Message received:", data);

  if (!currentRoomId) {
    console.log("❌ No room joined");
    return;
  }

  io.to(currentRoomId).emit("receive-message", data);

});

// ==========================================
// File Sharing
// ==========================================

socket.on("share-file", (fileData) => {

  console.log(
    "📎 File shared:",
    fileData.originalName,
    "by",
    fileData.uploaderName
  );

  if (!currentRoomId) {
    console.log("❌ No room joined");
    return;
  }

  // Send file information to everyone in the room
  socket.to(currentRoomId).emit(
    "file-shared",
    fileData
  );

});

    // ==========================================
    // Whiteboard
    // ==========================================

    socket.on("draw", (data) => {

      if (!currentRoomId) return;

      socket.to(currentRoomId).emit(
        "draw",
        data
      );

    });

    socket.on("clear-board", () => {

      if (!currentRoomId) return;

      socket.to(currentRoomId).emit(
        "clear-board"
      );

    });

// ==========================================
// Toggle Meeting Lock
// ==========================================

socket.on("toggle-meeting-lock", ({ roomId }) => {

  console.log(
    "🔐 Toggle meeting lock request:",
    roomId
  );

  console.log(
    "🏠 Current rooms:",
    Object.keys(rooms)
  );

  console.log(
    "👤 Current socket:",
    socket.id
  );

  // Use the room stored for this socket
  const targetRoomId =
    currentRoomId || roomId;

  console.log(
    "🎯 Target room:",
    targetRoomId
  );

  // Check if room exists
  if (!rooms[targetRoomId]) {

    console.log(
      "❌ Room not found:",
      targetRoomId
    );

    return;
  }

  // ==========================================
  // Only Host Can Lock / Unlock
  // ==========================================

  if (
    rooms[targetRoomId].host !== socket.id
  ) {

    console.log(
      "❌ Only host can lock/unlock the meeting"
    );

    console.log(
      "👑 Actual host socket:",
      rooms[targetRoomId].host
    );

    return;
  }

  // ==========================================
  // Toggle Lock State
  // ==========================================

  rooms[targetRoomId].locked =
    !rooms[targetRoomId].locked;

  const isLocked =
    rooms[targetRoomId].locked;

  console.log(
    `🔐 Room ${targetRoomId} is now ${
      isLocked
        ? "LOCKED 🔒"
        : "UNLOCKED 🔓"
    }`
  );

  // ==========================================
  // Inform Everyone
  // ==========================================

  io.to(targetRoomId).emit(
    "meeting-lock-status",
    {
      locked: isLocked,
    }
  );

});

    // ==========================================
    // Kick User
    // ==========================================

    socket.on("kick-user", ({ socketId }) => {

      io.to(socketId).emit("kicked");

    });

// ==========================================
// End Meeting
// ==========================================

socket.on("end-meeting", ({ roomId }) => {

  console.log(
    "⛔ End meeting request:",
    roomId
  );

  // Use the room stored for this socket
  const targetRoomId = currentRoomId || roomId;

  console.log(
    "🎯 Target room:",
    targetRoomId
  );

  // Check whether room exists
  if (!rooms[targetRoomId]) {

    console.log(
      "❌ Room not found:",
      targetRoomId
    );

    return;
  }

  // Only the host can end the meeting
  if (
    rooms[targetRoomId].host !== socket.id
  ) {

    console.log(
      "❌ Only host can end the meeting"
    );

    console.log(
      "👑 Actual host socket:",
      rooms[targetRoomId].host
    );

    return;
  }

  console.log(
    `⛔ Meeting ${targetRoomId} is being ENDED`
  );

  // Inform everyone inside the meeting
  io.to(targetRoomId).emit(
    "meeting-ended"
  );

  // Delete the room
  delete rooms[targetRoomId];

  console.log(
    `🗑️ Room ${targetRoomId} deleted`
  );

});


    // ==========================================
    // Disconnect
    // ==========================================

    socket.on("disconnect", () => {

      console.log(`${currentUserName} disconnected`);

      if (currentRoomId && rooms[currentRoomId]) {

        rooms[currentRoomId].users =
          rooms[currentRoomId].users.filter(
            (user) => user.socketId !== socket.id
          );

        socket.to(currentRoomId).emit(
          "user-disconnected",
          {
            peerId: currentPeerId,
          }
        );

        // Delete room if empty
        if (rooms[currentRoomId].users.length === 0) {

          delete rooms[currentRoomId];

          console.log(
            `🗑 Room ${currentRoomId} deleted`
          );

        }

      }

    });

  });

};


module.exports = socketHandler;

