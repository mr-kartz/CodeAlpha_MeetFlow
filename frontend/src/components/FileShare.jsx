import { useEffect, useState } from "react";
import API from "../services/api";
import socket from "../services/socket";

function FileShare({ roomId }) {
  const currentUser =
  JSON.parse(localStorage.getItem("user"));

  const myName = currentUser?.name || "You";

  const [selectedFile, setSelectedFile] = useState(null);

  const [uploading, setUploading] = useState(false);

  const [uploadedFile, setUploadedFile] = useState(null);

  // ==========================================
// Listen For Shared Files
// ==========================================

useEffect(() => {

  const handleFileShared = (fileData) => {

  console.log("📎 FILE RECEIVED BY THIS USER:");
  console.log(fileData);

  console.log(
    "📤 Actual uploader:",
    fileData.uploaderName
  );

  setUploadedFile(fileData);

};

  socket.on(
    "file-shared",
    handleFileShared
  );

  return () => {

    socket.off(
      "file-shared",
      handleFileShared
    );

  };

}, []);

  // ==========================================
  // Select File
  // ==========================================

  const handleFileChange = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    setSelectedFile(file);

  };

  // ==========================================
  // Upload File
  // ==========================================

  const handleUpload = async () => {

    if (!selectedFile) {

      alert("Please select a file first.");

      return;

    }

    try {

      setUploading(true);

      const formData = new FormData();

      formData.append(
        "file",
        selectedFile
      );

      console.log(
        "📤 Uploading:",
        selectedFile.name
      );

      const response =
        await API.post(
          "/files/upload",
          formData
        );

      console.log(
        "✅ Upload response:",
        response.data
      );

  // Get uploaded file information
  const uploadedFile = response.data.file;

  // Share file with everyone in this meeting room
  socket.emit("share-file", {

  roomId: roomId,

  originalName : uploadedFile.originalName,

  fileName : uploadedFile.fileName,

  fileUrl : uploadedFile.fileUrl,

  fileSize : uploadedFile.fileSize,

  mimeType : uploadedFile.mimeType,

  uploaderName: myName,

});

console.log(
  "📎 File shared with room:",
  roomId
);

// Show file on sender's screen
setUploadedFile({
  ...uploadedFile,
  uploaderName: myName,
});

      setSelectedFile(null);

      alert("File uploaded successfully!");

    } catch (error) {

      console.error(
        "❌ File upload error:",
        error
      );

      alert(
        error.response?.data?.message ||
        "File upload failed"
      );

    } finally {

      setUploading(false);

    }

  };

  return (

  <div
    className="file-share-container"
    style={{
      padding: "20px",
      background: "#17233b",
      borderRadius: "12px",
      color: "white",
    
    }}
  >

      <h3>📎 File Sharing</h3>

      {/* File Picker */}

      <input
        type="file"
        onChange={handleFileChange}
      />

      {/* Selected File */}

      {selectedFile && (

        <div
          style={{
            marginTop: "12px",
          }}
        >

          <p>
            📄 {selectedFile.name}
          </p>

          <button
            onClick={handleUpload}
            disabled={uploading}
          >

            {uploading
              ? "Uploading..."
              : "⬆️ Upload"}

          </button>

        </div>

      )}

      {/* Uploaded File */}

      {uploadedFile && (

        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            background: "#243452",
            borderRadius: "8px",
          }}
        >

          <p>
            ✅ Uploaded:
          </p>

          <p>
          👤 By: {uploadedFile.uploaderName}
          </p>

          <p>
            📄 {uploadedFile.originalName}
          </p>

          <a
            href={uploadedFile.fileUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              color: "#61dafb",
            }}
          >

            Open / Download

          </a>

        </div>

      )}

    </div>

  );

}

export default FileShare;