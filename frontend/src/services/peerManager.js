import peer from "./peer";

class PeerManager {

  constructor() {

    this.calls = {};

    this.connectedPeers = new Set();

  }

  // =====================================
  // Create Call
  // =====================================

  callUser(peerId, stream, onStream) {

    if (!peerId) return;

    if (this.connectedPeers.has(peerId)) return;

    const call = peer.call(peerId, stream);

    if (!call) return;

    this.connectedPeers.add(peerId);

    this.calls[peerId] = call;

    call.on("stream", (remoteStream) => {

      onStream(remoteStream);

    });

    call.on("close", () => {

      this.removePeer(peerId);

    });

    call.on("error", (err) => {

      console.error(err);

      this.removePeer(peerId);

    });

  }

  // =====================================
  // Receive Incoming Call
  // =====================================

  answerCall(call, stream, onStream) {

    call.answer(stream);

    this.calls[call.peer] = call;

    this.connectedPeers.add(call.peer);

    call.on("stream", (remoteStream) => {

      onStream(remoteStream);

    });

    call.on("close", () => {

      this.removePeer(call.peer);

    });

  }

  // =====================================
  // Remove Peer
  // =====================================

  removePeer(peerId) {

    if (this.calls[peerId]) {

      this.calls[peerId].close();

      delete this.calls[peerId];

    }

    this.connectedPeers.delete(peerId);

  }

  // =====================================
  // Replace Video Track
  // =====================================

  replaceVideoTrack(track) {

    Object.values(this.calls).forEach((call) => {

      const sender =
        call.peerConnection
          ?.getSenders()
          ?.find(
            (s) =>
              s.track &&
              s.track.kind === "video"
          );

      if (sender) {

        sender.replaceTrack(track);

      }

    });

  }

  // =====================================
  // Destroy Everything
  // =====================================

  destroy() {

    Object.values(this.calls).forEach((call) => {

      call.close();

    });

    this.calls = {};

    this.connectedPeers.clear();

    if (!peer.destroyed) {

      peer.destroy();

    }

  }

}

export default new PeerManager();