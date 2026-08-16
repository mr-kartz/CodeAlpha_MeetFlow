import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPhoneSlash,
} from "react-icons/fa";

import "../styles/controls.css";

function BottomControls({
  micOn,
  cameraOn,
  toggleMic,
  toggleCamera,
  leaveMeeting,
  children,
}) {
  return (
    <div className="bottom-controls">

      <button onClick={toggleMic}>
        {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
      </button>

      <button onClick={toggleCamera}>
        {cameraOn ? <FaVideo /> : <FaVideoSlash />}
      </button>

      {children}

      <button
        className="leave-btn"
        onClick={leaveMeeting}
      >
        <FaPhoneSlash />
      </button>

    </div>
  );
}

export default BottomControls;