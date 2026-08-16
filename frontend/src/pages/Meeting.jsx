import { useParams } from "react-router-dom";
import Chat from "../components/Chat";
import VideoCall from "../components/VideoCall";
import FileShare from "../components/FileShare";
import Participants from "../components/Participants";
import "../styles/meeting.css";
import { useEffect, useState, useCallback } from "react";
import Toast from "../components/Toast"; 
import socket from "../services/socket";



function Meeting() {
  const { roomId } = useParams();
  
  const currentUser = JSON.parse(localStorage.getItem("user"));  
  console.log(currentUser);

  const [participants, setParticipants] = useState([]);
  const [isHost, setIsHost] = useState(false);

  const [meetingLocked, setMeetingLocked] = useState(false);

  const [seconds, setSeconds] = useState(0);

  const [roomJoined, setRoomJoined] = useState(false);

  // ==========================================
// Toast
// ==========================================

const [toast, setToast] = useState({
  message: "",
  type: "success",
});

const showToast = useCallback((message, type = "success") => {

  setToast({
    message,
    type,
  });

  setTimeout(() => {

    setToast({
      message: "",
      type: "success",
    });

  }, 2000);

}, []);

  useEffect(() => {

  const handleRoomJoined = () => {
    console.log("✅ Room Joined");
    setRoomJoined(true);
  };

  socket.on("room-joined", handleRoomJoined);

  return () => {
    socket.off("room-joined", handleRoomJoined);
  };

}, []);

useEffect(() => {

  const handleHostStatus = ({ isHost }) => {

    console.log(
      "👑 Host Status:",
      isHost
    );

    setIsHost(isHost);

  };

  socket.on(
    "host-status",
    handleHostStatus
  );

  return () => {

    socket.off(
      "host-status",
      handleHostStatus
    );

  };

}, []);


// ==========================================
// Meeting Lock Status
// ==========================================

useEffect(() => {

  const handleMeetingLockStatus = ({ locked }) => {

    console.log(
      locked
        ? "🔒 Meeting has been locked"
        : "🔓 Meeting has been unlocked"
    );

    setMeetingLocked(locked);

    showToast(
      locked
        ? "🔒 Meeting locked"
        : "🔓 Meeting unlocked",
      "info"
    );

  };

  socket.on(
    "meeting-lock-status",
    handleMeetingLockStatus
  );

  return () => {

    socket.off(
      "meeting-lock-status",
      handleMeetingLockStatus
    );

  };

}, [showToast]);


  useEffect(() => {
  const timer = setInterval(() => {
    setSeconds((prev) => prev + 1);
  }, 1000);

  return () => clearInterval(timer);
}, []);


useEffect(() => {

  const handleExistingParticipants = (users) => {

    console.log("👥 Existing Participants:", users);

    setParticipants(users);

  };

  const handleUserConnected = (participant) => {

    console.log("👤 User Connected:", participant);

    setParticipants((prev) => {

      // Prevent duplicates
      const exists = prev.some(
        (user) => user.peerId === participant.peerId
      );

      if (exists) {
        return prev;
      }

      return [...prev, participant];

    });

    showToast(
      `👤 ${participant.name} joined the meeting`,
      "info"
    );

  };

  const handleUserDisconnected = ({ peerId }) => {

    console.log(
      "👋 User Disconnected:",
      peerId
    );

    setParticipants((prev) =>
      prev.filter(
        (user) => user.peerId !== peerId
      )
    );

    showToast(
      "👋 Someone left the meeting",
      "error"
    );

  };

  socket.on(
    "existing-participants",
    handleExistingParticipants
  );

  socket.on(
    "user-connected",
    handleUserConnected
  );

  socket.on(
    "user-disconnected",
    handleUserDisconnected
  );

  return () => {

    socket.off(
      "existing-participants",
      handleExistingParticipants
    );

    socket.off(
      "user-connected",
      handleUserConnected
    );

    socket.off(
      "user-disconnected",
      handleUserDisconnected
    );

  };

}, [showToast]);

// ==========================================
// Meeting Ended
// ==========================================

useEffect(() => {

  const handleMeetingEnded = () => {

    console.log("⛔ Meeting has been ended by the host");

    showToast(
      "⛔ Meeting ended by the host",
      "error"
    );

  };

  socket.on(
    "meeting-ended",
    handleMeetingEnded
  );

  return () => {

    socket.off(
      "meeting-ended",
      handleMeetingEnded
    );

  };

}, [showToast]);

  const formatTime = () => {
  const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  return `${hrs}:${mins}:${secs}`;
};

  return (
    <div className="meeting-container">

      {/* Left Sidebar */}
      <aside className="left-sidebar">
        <Participants participants={participants} 
                      isHost={isHost}/>
      </aside>

      {/* Center Panel */}
      <main className="center-panel">

 <div className="meeting-header">

  {/* Left Side */}
  <div className="meeting-left">

    <h1>
      🎥 MeetFlow
    </h1>

    <p className="room-id">
      Room ID :
      <strong> {roomId}</strong>
    </p>

    <button
        className="copy-room-btn"
        onClick={() => {
        navigator.clipboard.writeText(roomId);
        showToast("✅ Room ID Copied");
}}
    >
      📋 Copy Room ID
    </button>

  </div>

  {/* Right Side */}

  <div className="connection-status">

     <div>
    {meetingLocked
      ? "🔒 Meeting Locked"
      : "🟢 Connected"
    }
  </div>

    <small>
      {formatTime()}
    </small>

  </div>

  <Toast
  message={toast.message}
  type={toast.type}
/>

</div>

        <VideoCall
  roomId={roomId}
  isHost={isHost}
  meetingLocked={meetingLocked}
/>


      </main>

      {/* Right Sidebar */}
<aside className="right-sidebar">

    {/* CHAT SECTION */}
    <div className="chat-section">

        <Chat
            roomId={roomId}
            roomJoined={roomJoined}
        />

    </div>


    {/* FILE SHARING SECTION */}
    <div className="file-section">

        <FileShare
            roomId={roomId}
        />

    </div>

</aside>

    </div>
  );
}

export default Meeting;