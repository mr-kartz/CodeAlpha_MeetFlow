// ==========================================
// Media Manager
// Handles Camera, Mic, Screen Share & Cleanup
// ==========================================

class MediaManager {

  constructor() {
    this.stream = null;
  }

  // ==========================================
  // Start Camera & Microphone
  // ==========================================

 async startCamera(force = false) {

  if (this.stream && !force) {
    return this.stream;
  }

  if (this.stream) {
    this.stream.getTracks().forEach(track => track.stop());
  }

  this.stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  return this.stream;
}

  // ==========================================
  // Get Current Stream
  // ==========================================

  getStream() {

    return this.stream;

  }

  // ==========================================
  // Toggle Camera
  // ==========================================

  toggleCamera() {

    if (!this.stream) return false;

    const track =
      this.stream.getVideoTracks()[0];

    if (!track) return false;

    track.enabled = !track.enabled;

    return track.enabled;

  }

  // ==========================================
  // Toggle Microphone
  // ==========================================

  toggleMic() {

    if (!this.stream) return false;

    const track =
      this.stream.getAudioTracks()[0];

    if (!track) return false;

    track.enabled = !track.enabled;

    return track.enabled;

  }

  // ==========================================
  // Screen Share
  // ==========================================

  async startScreenShare() {

    const screenStream =
      await navigator.mediaDevices.getDisplayMedia({

        video: true,

      });

    return screenStream;

  }

  replaceVideoTrack(peerConnections, newTrack) {

  Object.values(peerConnections).forEach((connections) => {

    connections.forEach((call) => {

      const sender =
        call.peerConnection
          ?.getSenders()
          ?.find(
            (s) =>
              s.track &&
              s.track.kind === "video"
          );

      if (sender) {

        sender.replaceTrack(newTrack);

      }

    });

  });

}

  // ==========================================
  // Stop Everything
  // ==========================================

  stopAllTracks() {

    if (!this.stream) return;

    this.stream
      .getTracks()
      .forEach(track => track.stop());

    this.stream = null;

  }

}

export default new MediaManager();