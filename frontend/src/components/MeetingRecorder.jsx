import { useRef, useState } from "react";

function MeetingRecorder({ stream }) {
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const [recording, setRecording] = useState(false);

  const startRecording = () => {
    if (!stream) return;

    chunksRef.current = [];

    const recorder = new MediaRecorder(stream);

    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {
        type: "video/webm",
      });

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;

      a.download = `MeetFlow-${Date.now()}.webm`;

      a.click();

      URL.revokeObjectURL(url);
    };

    recorder.start();

    setRecording(true);
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <button
      onClick={
        recording
          ? stopRecording
          : startRecording
      }
    >
      {recording ? "⏹ Stop Recording" : "🔴 Record"}
    </button>
  );
}

export default MeetingRecorder;