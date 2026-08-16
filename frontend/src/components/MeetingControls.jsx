import ScreenShare from "./ScreenShare";
import BottomControls from "./BottomControls";

import { FaPen, FaCircle } from "react-icons/fa";

function MeetingControls({

  micOn,

  cameraOn,

  toggleMic,

  toggleCamera,

  leaveMeeting,

  handleScreenShare,

  recording,

  startRecording,

  stopRecording,

  setShowWhiteboard,

}) {

  return (

    <BottomControls

      micOn={micOn}

      cameraOn={cameraOn}

      toggleMic={toggleMic}

      toggleCamera={toggleCamera}

      leaveMeeting={leaveMeeting}

    >

      <ScreenShare

        onShare={handleScreenShare}

      />

      <button

        className="control-btn"

        onClick={() =>

          setShowWhiteboard(true)

        }

      >

        <FaPen />

        Whiteboard

      </button>

      <button

        className="control-btn"

        onClick={

          recording

            ? stopRecording

            : startRecording

        }

      >

        <FaCircle

          style={{

            color:

              recording

                ? "#22c55e"

                : "#ef4444",

          }}

        />

        {

          recording

            ? "Stop Recording"

            : "Record"

        }

      </button>

    </BottomControls>

  );

}

export default MeetingControls;