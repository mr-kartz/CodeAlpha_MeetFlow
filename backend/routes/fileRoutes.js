const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  uploadFile,
} = require("../controllers/fileController");

const router = express.Router();

// ==========================================
// Multer Storage
// ==========================================

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    cb(
       null,
       path.join(__dirname, "../uploads")
    );

  },

  filename: (req, file, cb) => {

    const uniqueName =
      `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;

    cb(null, uniqueName);

  },

});

// ==========================================
// File Filter
// ==========================================

const fileFilter = (req, file, cb) => {

  const allowedTypes = [

    "image/jpeg",
    "image/png",
    "image/gif",

    "application/pdf",

    "text/plain",

    "application/zip",

    "application/x-zip-compressed",

    "application/msword",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    "application/vnd.ms-powerpoint",

    "application/vnd.openxmlformats-officedocument.presentationml.presentation",

    "application/vnd.ms-excel",

    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  ];

  if (allowedTypes.includes(file.mimetype)) {

    cb(null, true);

  } else {

    cb(
      new Error("File type not supported"),
      false
    );

  }

};

// ==========================================
// Multer Upload
// ==========================================

const upload = multer({

  storage,

  fileFilter,

  limits: {

    fileSize: 10 * 1024 * 1024,

  },

});

// ==========================================
// Upload Route
// ==========================================

router.post(
  "/upload",
  upload.single("file"),
  uploadFile
);

module.exports = router;