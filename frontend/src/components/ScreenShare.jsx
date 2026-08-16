import { useRef, useState } from "react";
import {
  FaDesktop,
  FaStopCircle,
} from "react-icons/fa";

function ScreenShare({ onShare,onStop }) {
  const [sharing, setSharing] = useState(false);

  const screenStreamRef = useRef(null);

  const handleShare = async () => {

    // ===========================
    // STOP SHARING
    // ===========================

    if (sharing) {

  if (screenStreamRef.current) {

    screenStreamRef.current
      .getTracks()
      .forEach((track) => track.stop());

  }

  screenStreamRef.current = null;

  setSharing(false);

  // Tell VideoCall to restore camera
  if (onStop) {
    onStop();
  }

  return;
}

    // ===========================
    // START SHARING
    // ===========================

    try {

      const screenStream =
        await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });

      screenStreamRef.current = screenStream;

      setSharing(true);

      onShare(screenStream);

      const track =
        screenStream.getVideoTracks()[0];

      track.onended = () => {

        screenStreamRef.current = null;

        setSharing(false);

      };

    } catch (err) {

      console.error(err);

    }

  };

  return (

    <button
      className="control-btn"
      onClick={handleShare}
    >

      {sharing ? (
        <>
          <FaStopCircle /> Stop Sharing
        </>
      ) : (
        <>
          <FaDesktop /> Share Screen
        </>
      )}

    </button>

  );

}

export default ScreenShare;