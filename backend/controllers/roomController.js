const Room = require("../models/Room");
const { nanoid } = require("nanoid");

// Create Room
const createRoom = async (req, res) => {
  try {
    const room = await Room.create({
      roomId: "MF-" + nanoid(6).toUpperCase(),
      host: req.user._id,
      participants: [req.user._id],
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Join Room
const joinRoom = async (req, res) => {
  try {
    const room = await Room.findOne({
      roomId: req.params.roomId,
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    if (!room.participants.includes(req.user._id)) {
      room.participants.push(req.user._id);
      await room.save();
    }

    res.json(room);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createRoom,
  joinRoom,
};
