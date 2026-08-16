import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Dashboard() {
  const [roomId, setRoomId] = useState("");

  const navigate = useNavigate();

  const createMeeting = async () => {
    try {
      const res = await API.post("/room/create");

      navigate(`/meeting/${res.data.roomId}`);

    } catch (err) {
      alert("Unable to create room");
    }
  };

  const joinMeeting = () => {
    if (!roomId.trim()) return;

    navigate(`/meeting/${roomId}`);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <h1>MeetFlow Dashboard</h1>

      <button onClick={createMeeting}>
        ➕ Create Meeting
      </button>

      <input
        placeholder="Enter Meeting ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />

      <button onClick={joinMeeting}>
        Join Meeting
      </button>
    </div>
  );
}

export default Dashboard;