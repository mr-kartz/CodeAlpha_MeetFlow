// ==========================================
// File Controller
// ==========================================

const uploadFile = (req, res) => {

  try {

    if (!req.file) {

      return res.status(400).json({
        message: "No file uploaded",
      });

    }

    const fileUrl =
      `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    console.log("📎 File uploaded:", req.file.originalname);

    res.status(200).json({

      message: "File uploaded successfully",

      file: {

        originalName: req.file.originalname,

        fileName: req.file.filename,

        fileUrl: fileUrl,

        fileSize: req.file.size,

        mimeType: req.file.mimetype,

      },

    });

  } catch (error) {

    console.error(
      "❌ File Upload Error:",
      error
    );

    res.status(500).json({
      message: "File upload failed",
    });

  }

};

module.exports = {
  uploadFile,
};