import Peer from "peerjs";

console.log("🚀 Creating Peer Object...");

const peer = new Peer(undefined, {
  host: window.location.hostname,
  port: window.location.port,
  path: "/peerjs",
  secure: true,
});

// Debug Logs
peer.on("open", (id) => {
  console.log("🌍 GLOBAL OPEN:", id);
});

peer.on("error", (err) => {
  console.error("🌍 GLOBAL ERROR:", err);
});

peer.on("disconnected", () => {
  console.log("🌍 GLOBAL DISCONNECTED");
});

export default peer;