import { useEffect, useRef, useState } from "react";

import Peer from "peerjs";
import socket from "../services/socket";
import mediaManager from "../services/mediaManager";
import ScreenShare from "./ScreenShare";
import BottomControls from "./BottomControls";
import Whiteboard from "./Whiteboard";

import { FaPen, FaCircle } from "react-icons/fa";

import "../styles/videocall.css";

// =====================================
// Remote Video Card
// =====================================

function RemoteVideo({ participant }) {

  const videoRef = useRef(null);

 useEffect(() => {

  if (!videoRef.current || !participant.stream) return;

  console.log("🎥 Remote stream received:", participant.name);

  videoRef.current.srcObject = participant.stream;

  videoRef.current.onloadedmetadata = () => {

    videoRef.current.play().catch(console.error);

  };

}, [participant.stream, participant.name]);

  return (

    <div className="video-card">

      <video
        ref={videoRef}
        data-peer-id={participant.peerId}
        autoPlay
        playsInline
      />

      <div className="video-name">
        👤 {participant.name}
      </div>

    </div>

  );

}

// =====================================
// Main Component
// =====================================

function VideoCall({ roomId, isHost, meetingLocked,}) 
  {

  // ===============================
  // Video & Media Refs
  // ===============================

  const localVideoRef = useRef(null);

  const localStreamRef = useRef(null);
  const localAudioStreamRef = useRef(null);

  const peersRef = useRef({});

  const peerRef = useRef(null);

  const [socketReady, setSocketReady] = useState(false);

  const mediaRecorderRef = useRef(null);

  const recordedChunksRef = useRef([]);
  // =====================================
  // Full Meeting Recording
 // =====================================

  const recordingCanvasRef = useRef(null);

  const recordingAnimationRef = useRef(null); 

  const recordingAudioContextRef = useRef(null);

  const recordingAudioDestinationRef = useRef(null); 


  const recordingStreamRef = useRef(null);

  // ===============================
  // User Info
  // ===============================

  const currentUser =
    JSON.parse(localStorage.getItem("user")) || {};

  const myName =
    currentUser.name || "Guest";

  // ===============================
  // States
  // ===============================

  const [peerId, setPeerId] = useState("");

  const [participants, setParticipants] = useState([]);

  const [cameraOn, setCameraOn] = useState(true);

  const [micOn, setMicOn] = useState(true);

  const [recording, setRecording] = useState(false);

  const [screenSharing, setScreenSharing] = useState(false);

  const [showWhiteboard, setShowWhiteboard] = useState(false);

  const [mediaReady, setMediaReady] = useState(false);

  const [peerReady, setPeerReady] = useState(false);

 

  

// =====================================
// Video Pagination
// =====================================

const [currentPage, setCurrentPage] = useState(0);

const VIDEOS_PER_PAGE = 4;

// Prevent duplicate calls
const connectedPeers = useRef(new Set());

// =====================================
// Socket Ready
// =====================================

useEffect(() => {

  const handleConnect = () => {

    console.log("🟢 Socket Connected");

    setSocketReady(true);

  };

  const handleDisconnect = () => {

    console.log("🔴 Socket Disconnected");

    setSocketReady(false);

  };

  socket.on("connect", handleConnect);
  socket.on("disconnect", handleDisconnect);

  // Handle already-connected socket
  if (socket.connected) {
    handleConnect();
  }

  return () => {

    socket.off("connect", handleConnect);
    socket.off("disconnect", handleDisconnect);

  };

}, []);

  // ===============================
  // Start Camera & Microphone
  // ===============================

  useEffect(() => {

    let active = true;

    const startMedia = async () => {

      console.log("navigator =", navigator);
      console.log("navigator.mediaDevices =", navigator.mediaDevices);
      console.log("window.isSecureContext =", window.isSecureContext);
      console.log("location.protocol =", location.protocol);
      console.log("Current URL =", window.location.href);
      console.log("Hostname =", window.location.hostname);

      try {

      if (!navigator.mediaDevices) {
        throw new Error("navigator.mediaDevices is undefined");
      }

      if (!navigator.mediaDevices.getUserMedia) {
        throw new Error("getUserMedia is not available");
      }

        console.log("🎥 Requesting camera permission...");
        
        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });

        console.log("✅ getUserMedia returned:", stream);
        if (!active) return;

        localStreamRef.current = stream;
        localAudioStreamRef.current = new MediaStream(stream.getAudioTracks());

        console.log("✅ Local stream saved");

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        setMediaReady(true);

       console.log("✅ Media Ready State Updated");

        console.log("✅ Camera Ready");

      } catch (err) {

  console.error("❌ Camera Error");
  console.error("Name:", err.name);
  console.error("Message:", err.message);
  console.error("Full Error:", err);

}

    };

    startMedia();

    return () => {

      active = false;

    };

  }, []);


// =====================================
// Create Peer
// =====================================

useEffect(() => {

  console.log("🚀 Creating Peer...");

  const peer = new Peer(undefined, {
  host: window.location.hostname,
  port: window.location.port,
  path: "/peerjs",
  secure: true,
});

  peerRef.current = peer;

  peerRef.current.on("open", (id) => {

    console.log("✅ Peer Connected:", id);

    setPeerId(id);

    setPeerReady(true);

  });

  peerRef.current.on("error", (err) => {

    console.error("❌ Peer Error:", err);

  });

  peerRef.current.on("disconnected", () => {

    console.log("🔴 Peer Disconnected");

    setPeerReady(false);

  });

  return () => {

    console.log("🧹 Destroying Peer");

    if (peerRef.current && !peerRef.current.destroyed) {
      peerRef.current.destroy();
    }

  };

}, []);

// =====================================
// Join Room
// =====================================

useEffect(() => {

  if (
    !socketReady ||
    !peerReady ||
    !peerId ||
    !localStreamRef.current
  ) {
    return;
  }

  console.log("🚀 Joining Room...");

  socket.emit("join-room", {
    roomId,
    peerId,
    name: myName,
  });

}, [
  socketReady,
  peerReady,
  peerId,
  mediaReady,
  roomId,
  myName,
]);

  // =====================================
  // Receive Incoming Calls
  // =====================================

  useEffect(() => {

    const handleCall = (call) => {

      console.log("📞 Incoming Call:", call.peer);

      if (!localStreamRef.current) {

        console.log("Local stream not ready");

        return;

      }

      call.answer(localStreamRef.current);

      call.on("stream", (remoteStream) => {

        peersRef.current[call.peer] = {

          peerId: call.peer,

          name: "Participant",

          stream: remoteStream,

        };

        setParticipants(

          Object.values(peersRef.current)

        );

      });

      call.on("close", () => {

        delete peersRef.current[call.peer];

        connectedPeers.current.delete(call.peer);

        setParticipants(

          Object.values(peersRef.current)

        );

      });

      call.on("error", (err) => {

        console.error(err);

      });

    };

   peerRef.current.on("call", handleCall);

    return () => {

       peerRef.current.off("call", handleCall);

    };

  }, []);

  // =====================================
  // New User Joined
  // =====================================

  useEffect(() => {

    const handleUserConnected = (user) => {

      if (!user) return;

      if (user.peerId === peerId) return;

      if (connectedPeers.current.has(user.peerId)) return;

      if (!localStreamRef.current) return;

      connectedPeers.current.add(user.peerId);

      console.log("📞 Calling", user.name);

      const call = peerRef.current.call(

        user.peerId,

        localStreamRef.current

      );

      if (!call) {

        console.log("Call failed");

        connectedPeers.current.delete(user.peerId);

        return;

      }

      call.on("stream", (remoteStream) => {

        peersRef.current[user.peerId] = {

          peerId: user.peerId,

          name: user.name,

          stream: remoteStream,

        };

        setParticipants(

          Object.values(peersRef.current)

        );

      });

      call.on("close", () => {

        delete peersRef.current[user.peerId];

        connectedPeers.current.delete(user.peerId);

        setParticipants(

          Object.values(peersRef.current)

        );

      });

    };

    socket.on(

      "user-connected",

      handleUserConnected

    );

    return () => {

      socket.off(

        "user-connected",

        handleUserConnected

      );

    };

  }, [peerId]);

  // =====================================
  // Existing Participants
  // =====================================

  useEffect(() => {

    const handleExistingParticipants = (users = []) => {

      users.forEach((user) => {

        if (!user) return;

        if (user.peerId === peerId) return;

        if (connectedPeers.current.has(user.peerId)) return;

        if (!localStreamRef.current) return;

        connectedPeers.current.add(user.peerId);

        console.log("📞 Connecting to existing:", user.name);

        const call = peerRef.current.call(
          user.peerId,
          localStreamRef.current
        );

        if (!call) {
          connectedPeers.current.delete(user.peerId);
          return;
        }

        call.on("stream", (remoteStream) => {

          peersRef.current[user.peerId] = {
            peerId: user.peerId,
            name: user.name,
            stream: remoteStream,
          };

          setParticipants(
            Object.values(peersRef.current)
          );

        });

        call.on("close", () => {

          delete peersRef.current[user.peerId];

          connectedPeers.current.delete(user.peerId);

          setParticipants(
            Object.values(peersRef.current)
          );

        });

        call.on("error", (err) => {

          console.error(err);

          connectedPeers.current.delete(user.peerId);

        });

      });

    };

    socket.on(
      "existing-participants",
      handleExistingParticipants
    );

    return () => {

      socket.off(
        "existing-participants",
        handleExistingParticipants
      );

    };

  }, [peerId]);

  // =====================================
  // User Left
  // =====================================

  useEffect(() => {

    const handleUserDisconnected = ({ peerId }) => {

      console.log("👋 User Left:", peerId);

      delete peersRef.current[peerId];

      connectedPeers.current.delete(peerId);

      setParticipants(
        Object.values(peersRef.current)
      );

    };

    socket.on(
      "user-disconnected",
      handleUserDisconnected
    );

    return () => {

      socket.off(
        "user-disconnected",
        handleUserDisconnected
      );

    };

  }, []);

  // =====================================
  // Cleanup
  // =====================================

useEffect(() => {

  const connectedPeersRef = connectedPeers;
  const currentPeersRef = peersRef;

  return () => {

    console.log("🧹 Cleaning up...");

    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track) => track.stop());
    }

    Object.values(currentPeersRef.current).forEach((participant) => {

      if (participant.stream) {
        participant.stream
          .getTracks()
          .forEach((track) => track.stop());
      }

    });

    connectedPeersRef.current.clear();

    currentPeersRef.current = {};

    socket.off("host-status");
    socket.off("existing-participants");
    socket.off("user-connected");
    socket.off("user-disconnected");
    socket.off("meeting-ended");

  };

}, []);

  // =====================================
  // Toggle Microphone
  // =====================================

  const toggleMic = () => {

    if (!localStreamRef.current) return;

    localStreamRef.current
      .getAudioTracks()
      .forEach((track) => {

        track.enabled = !track.enabled;

      });

    setMicOn((prev) => !prev);

  };

  // =====================================
  // Toggle Camera
  // =====================================

  const toggleCamera = () => {

    if (!localStreamRef.current) return;

    localStreamRef.current
      .getVideoTracks()
      .forEach((track) => {

        track.enabled = !track.enabled;

      });

    setCameraOn((prev) => !prev);

  };

// =====================================
// Start Screen Share
// =====================================

const handleScreenShare = async (screenStream) => {

  if (!screenStream) return;

  console.log("🖥️ Screen sharing started");

  setScreenSharing(true);

  localStreamRef.current = screenStream;

  if (localVideoRef.current) {
    localVideoRef.current.srcObject = screenStream;
  }

  const screenTrack =
    screenStream.getVideoTracks()[0];

  mediaManager.replaceVideoTrack(
    peerRef.current.connections,
    screenTrack
  );

};

// =====================================
// Stop Screen Share & Restore Camera
// =====================================

const handleScreenShareStop = async () => {

  console.log("🛑 Screen sharing stopped");

  try {

    const cameraStream =
      await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

    localStreamRef.current = cameraStream;

    if (localVideoRef.current) {

      localVideoRef.current.srcObject =
        cameraStream;

    }

    const cameraTrack =
      cameraStream.getVideoTracks()[0];

    mediaManager.replaceVideoTrack(
      peerRef.current.connections,
      cameraTrack
    );

    console.log("📹 Camera restored");

  } catch (err) {

    console.error(
      "❌ Camera Restore Error:",
      err
    );

  }

  setScreenSharing(false);

};


  // =====================================
// Create Full Meeting Recording Stream
// =====================================

const createMeetingRecordingStream = async () => {

  console.log("🎬 Creating full meeting recording stream...");

  // -------------------------------------
  // Create recording canvas
  // -------------------------------------

  const canvas = document.createElement("canvas");

  canvas.width = 1280;
  canvas.height = 720;

  recordingCanvasRef.current = canvas;

  const ctx = canvas.getContext("2d");

  // -------------------------------------
  // Get video elements
  // -------------------------------------

  const videoElements = [];

  // Local video
  if (localVideoRef.current) {

    videoElements.push({
      video: localVideoRef.current,
      name: `You (${myName})`,
    });

  }

  // Remote videos
  participants.forEach((participant) => {

    const video = document.querySelector(
      `[data-peer-id="${participant.peerId}"]`
    );

    if (video) {

      videoElements.push({
        video,
        name: participant.name,
      });

    }

  });

  // -------------------------------------
  // Draw videos onto canvas
  // -------------------------------------

  const drawFrame = () => {

    ctx.fillStyle = "#111827";

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    const count = videoElements.length;

    if (count === 0) {

      ctx.fillStyle = "white";
      ctx.font = "32px Arial";
      ctx.textAlign = "center";

      ctx.fillText(
        "MeetFlow Recording",
        canvas.width / 2,
        canvas.height / 2
      );

    } else {

      const columns =
        count === 1
          ? 1
          : count <= 4
            ? 2
            : 3;

      const rows =
        Math.ceil(count / columns);

      const tileWidth =
        canvas.width / columns;

      const tileHeight =
        canvas.height / rows;

      videoElements.forEach((item, index) => {

        const column =
          index % columns;

        const row =
          Math.floor(index / columns);

        const x =
          column * tileWidth;

        const y =
          row * tileHeight;

        try {

          ctx.drawImage(
            item.video,
            x,
            y,
            tileWidth,
            tileHeight
          );

        } catch (err) {

          console.warn(
            "Could not draw video:",
            item.name,
            err
          );

        }

        // Participant name
        ctx.fillStyle =
          "rgba(0, 0, 0, 0.6)";

        ctx.fillRect(
          x,
          y + tileHeight - 40,
          tileWidth,
          40
        );

        ctx.fillStyle = "white";

        ctx.font =
          "18px Arial";

        ctx.textAlign = "left";

        ctx.fillText(
          item.name,
          x + 15,
          y + tileHeight - 15
        );

      });

    }

    recordingAnimationRef.current =
      requestAnimationFrame(drawFrame);

  };

  drawFrame();

  // -------------------------------------
  // Capture canvas video
  // -------------------------------------

  const canvasStream =
    canvas.captureStream(30);

  // -------------------------------------
  // Create audio mixer
  // -------------------------------------

  const audioContext =
    new AudioContext();

  recordingAudioContextRef.current =
    audioContext;

  const audioDestination =
    audioContext.createMediaStreamDestination();

  recordingAudioDestinationRef.current =
    audioDestination;

  // -------------------------------------
  // Add local microphone
  // -------------------------------------

  if (
    localAudioStreamRef.current &&
    localAudioStreamRef.current
      .getAudioTracks()
      .length > 0
  ) {

    const localAudioSource =
      audioContext.createMediaStreamSource(
        localAudioStreamRef.current
      );

    localAudioSource.connect(
      audioDestination
    );

  }

  // -------------------------------------
  // Add remote microphones
  // -------------------------------------

  participants.forEach((participant) => {

    if (!participant.stream) return;

    const audioTracks =
      participant.stream.getAudioTracks();

    if (audioTracks.length === 0) return;

    const remoteAudioStream =
      new MediaStream(audioTracks);

    const remoteAudioSource =
      audioContext.createMediaStreamSource(
        remoteAudioStream
      );

    remoteAudioSource.connect(
      audioDestination
    );

  });

  // -------------------------------------
  // Combine video + audio
  // -------------------------------------

  const recordingStream =
    new MediaStream();
    

  canvasStream
    .getVideoTracks()
    .forEach((track) => {

      recordingStream.addTrack(track);

    });

  audioDestination.stream
    .getAudioTracks()
    .forEach((track) => {

      recordingStream.addTrack(track);

    });

  console.log(
    "✅ Full meeting recording stream created"
  );

  return recordingStream;

};

  // =====================================
  // Start Recording
  // =====================================

  // =====================================
// Start Full Meeting Recording
// =====================================

const startRecording = async () => {

  if (!mediaReady) {

    alert("Media is not ready yet.");

    return;

  }

  try {

    console.log("🎬 Starting full meeting recording...");

    const recordingStream =
      await createMeetingRecordingStream();

    recordingStreamRef.current = recordingStream;

    if (!recordingStream) {

      alert("Unable to create recording stream.");

      return;

    }

    // Clear previous recording data
    recordedChunksRef.current = [];

    // Create MediaRecorder
    const recorder =
      new MediaRecorder(
        recordingStream,
        {
          mimeType: "video/webm;codecs=vp8,opus",
        }
      );

    mediaRecorderRef.current = recorder;

    // -------------------------------------
    // Recording data
    // -------------------------------------

    recorder.ondataavailable = (event) => {

      if (event.data.size > 0) {

        recordedChunksRef.current.push(
          event.data
        );

      }

    };

    // -------------------------------------
    // Recording stopped
    // -------------------------------------

    recorder.onstop = () => {

      console.log("🛑 Recording stopped");

      const blob = new Blob(
        recordedChunksRef.current,
        {
          type: "video/webm",
        }
      );

      const url =
        URL.createObjectURL(blob);

      const a =
        document.createElement("a");

      a.href = url;

      a.download =
        `MeetFlow-Full-Meeting-${Date.now()}.webm`;

      document.body.appendChild(a);

      a.click();

      a.remove();

      URL.revokeObjectURL(url);

      console.log(
        "💾 Full meeting recording downloaded"
      );

    };

    // -------------------------------------
    // Recorder error
    // -------------------------------------

    recorder.onerror = (event) => {

      console.error(
        "❌ Recording Error:",
        event.error
      );

      setRecording(false);

    };

    // -------------------------------------
    // Start
    // -------------------------------------

    recorder.start(1000);

    setRecording(true);

    console.log(
      "🔴 Full meeting recording started"
    );

  } catch (err) {

    console.error(
      "❌ Could not start recording:",
      err
    );

    alert(
      "Unable to start recording: " +
      err.message
    );

  }

};

  // =====================================
// Stop Full Meeting Recording
// =====================================

const stopRecording = () => {

  console.log("🛑 Stopping full meeting recording...");

  // Stop MediaRecorder
  if (
    mediaRecorderRef.current &&
    mediaRecorderRef.current.state !== "inactive"
  ) {

    mediaRecorderRef.current.stop();

  }

  // Stop canvas animation
  if (recordingAnimationRef.current) {

    cancelAnimationFrame(
      recordingAnimationRef.current
    );

    recordingAnimationRef.current = null;

  }

  // Stop recording stream tracks
  if (recordingStreamRef.current) {

    recordingStreamRef.current
      .getTracks()
      .forEach((track) => track.stop());

    recordingStreamRef.current = null;

  }

  // Close AudioContext
  if (recordingAudioContextRef.current) {

    recordingAudioContextRef.current
      .close()
      .catch((err) => {

        console.error(
          "AudioContext close error:",
          err
        );

      });

    recordingAudioContextRef.current = null;

  }

  recordingAudioDestinationRef.current =
    null;

  recordingCanvasRef.current =
    null;

  setRecording(false);

};

  // =====================================
  // Leave Meeting
  // =====================================

  const leaveMeeting = () => {

    if (localStreamRef.current) {

      localStreamRef.current
        .getTracks()
        .forEach((track) => track.stop());

    }

    connectedPeers.current.clear();

    peersRef.current = {};

    socket.emit("leave-room");

    window.location.href = "/";

  };

useEffect(() => {

  socket.on("meeting-ended", () => {

    alert("Meeting has ended by the host.");

    window.location.href = "/dashboard";

  });

  return () => {

    socket.off("meeting-ended");

  };

}, []);

// =====================================
// Video Pagination Calculation
// =====================================

const totalVideos = participants.length + 1;

const totalPages = Math.ceil(
  totalVideos / VIDEOS_PER_PAGE
);

// =====================================
// Videos Visible On Current Page
// =====================================

const visibleParticipants =
  currentPage === 0
    ? participants.slice(0, 3)
    : participants.slice(
        3 + ((currentPage - 1) * VIDEOS_PER_PAGE),
        3 + ((currentPage - 1) * VIDEOS_PER_PAGE) + VIDEOS_PER_PAGE
      );
      
  // =====================================
  // UI
  // =====================================

  return (

    <div className="video-container">

      {/* Peer ID */}

      <div
        style={{
          textAlign: "center",
          color: "white",
          marginBottom: "15px",
        }}
      >
        <strong>Your Peer ID :</strong> {peerId}
      </div>

      {/* Screen Share Status */}

      {screenSharing && (

        <div
          style={{
            textAlign: "center",
            color: "#22c55e",
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          🖥️ You are sharing your screen
        </div>

      )}

{/* ====================== */}
{/* Video Grid */}
{/* ====================== */}

<div className="video-grid">

  {/* Local Video - Only on First Page */}

  {currentPage === 0 && (
    <div className="video-card">

      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
      />

      <div className="video-name">
        🟢 You ({myName})
      </div>

    </div>
  )}

  {/* Remote Participants */}

  {visibleParticipants.map((participant) => (

    <RemoteVideo
      key={participant.peerId}
      participant={participant}
    />

  ))}

</div>

{/* ====================== */}
{/* Video Pagination */}
{/* ====================== */}

{totalPages > 1 && (

  <div className="video-pagination">

    <button
        className="page-btn"
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 0}
        title="Previous page"
        aria-label="Previous page"
    >
        ←
    </button>

    <span className="page-info">
        Page {currentPage + 1} of {totalPages}
    </span>

    <button
        className="page-btn"
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        title="Next page"
        aria-label="Next page"
    >
        →
    </button>

</div>

)}

      {/* ====================== */}
      {/* Whiteboard */}
      {/* ====================== */}

      {showWhiteboard && (

        <Whiteboard

          onClose={() => setShowWhiteboard(false)}

        />

      )}

      {/* ====================== */}
      {/* Bottom Controls */}
      {/* ====================== */}

      <BottomControls

        micOn={micOn}

        cameraOn={cameraOn}

        toggleMic={toggleMic}

        toggleCamera={toggleCamera}

        leaveMeeting={leaveMeeting}

      >

        {/* Screen Share */}

        <ScreenShare

          onShare={handleScreenShare}
          onStop={handleScreenShareStop}

        />

        {/* Whiteboard */}

        <button

          onClick={() => setShowWhiteboard(true)}

        >

          <FaPen />

          &nbsp; Whiteboard

        </button>

        {/* Recording */}

        <button

          onClick={

            recording

              ? stopRecording

              : startRecording

          }

        >

          <FaCircle

            style={{

              color: recording

                ? "#22c55e"

                : "#ef4444",

              marginRight: "8px",

            }}

          />

          {

            recording

              ? "Stop Recording"

              : "Record"

          }

        </button>

{/* Lock / Unlock Meeting */}

{isHost && (
  <button
    onClick={() => {
      socket.emit("toggle-meeting-lock", {
        roomId,
      });
    }}
    className="host-lock-btn"
  >
    {meetingLocked
      ? "🔓 Unlock"
      : "🔒 Lock"}
  </button>
)}

      </BottomControls>

    </div>

  );

}

export default VideoCall;  