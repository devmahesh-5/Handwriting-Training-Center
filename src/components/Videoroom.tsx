// VideoRoom.tsx
import { useEffect, useRef, useState } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from "react-icons/fa";
import io from "socket.io-client";

type PeerMap = { [socketId: string]: RTCPeerConnection };
type StreamsMap = { [socketId: string]: MediaStream };

export default function VideoRoom({ roomId, userId }: { roomId: string; userId?: string }) {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  // use ReturnType<typeof io> to avoid direct Socket<> import issues
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  const peerConnections = useRef<PeerMap>({});
  const [peers, setPeers] = useState<StreamsMap>({});
  const localStream = useRef<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  useEffect(() => {
    // Create socket inside effect (per-instance)
    const socket = io("https://handwriting-training-center.vercel.app/", {
      path: "/socketio",
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    async function startLocal() {
      try {
        localStream.current = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (localVideoRef.current && localStream.current) {
          localVideoRef.current.srcObject = localStream.current;
        }
        // join the call-room on the server
        socket.emit("join-call-room", { roomId });
      } catch (err) {
        console.error("Could not get user media:", err);
      }
    }
    startLocal();

    function createPeerConnection(remoteSocketId: string) {
      if (peerConnections.current[remoteSocketId]) {
        return peerConnections.current[remoteSocketId];
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      // add local tracks
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStream.current as MediaStream);
        });
      }

      pc.ontrack = (ev) => {
        const remoteStream = ev.streams[0];
        console.log("📡 ontrack from", remoteSocketId, remoteStream);
        setPeers((prev) => ({ ...prev, [remoteSocketId]: remoteStream }));
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("ice-candidate", {
            to: remoteSocketId,
            from: socketRef.current.id,
            candidate: event.candidate,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        console.log(`PC state for ${remoteSocketId}:`, pc.connectionState);
        if (pc.connectionState === "disconnected" || pc.connectionState === "failed" || pc.connectionState === "closed") {
          delete peerConnections.current[remoteSocketId];
          setPeers((prev) => {
            const copy = { ...prev };
            delete copy[remoteSocketId];
            return copy;
          });
        }
      };

      peerConnections.current[remoteSocketId] = pc;
      return pc;
    }

    // server will reply with list of existing users
    socket.on("all-users", async ({ users }: { users: string[] }) => {
      console.log("all-users:", users);
      for (const remoteId of users) {
        const pc = createPeerConnection(remoteId);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("offer", { to: remoteId, from: socket.id, offer });
          console.log("📤 Sent offer to existing user", remoteId);
        } catch (err) {
          console.error("Offer error:", err);
        }
      }
    });

    // when a new user joins after us
    socket.on("user-joined", async ({ socketId }: { socketId: string }) => {
      console.log("user-joined:", socketId);
      const pc = createPeerConnection(socketId);
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { to: socketId, from: socket.id, offer });
        console.log("📤 Sent offer to new user", socketId);
      } catch (err) {
        console.error("Offer->new user error:", err);
      }
    });

    socket.on("offer", async ({ from, offer }: { from: string; offer: RTCSessionDescriptionInit }) => {
      console.log("📥 Received offer from", from);
      const pc = createPeerConnection(from);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { to: from, from: socket.id, answer });
        console.log("📤 Sent answer to", from);
      } catch (err) {
        console.error("Error handling offer:", err);
      }
    });

    socket.on("answer", async ({ from, answer }: { from: string; answer: RTCSessionDescriptionInit }) => {
      console.log("📥 Received answer from", from);
      const pc = peerConnections.current[from];
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error("Error setting remote desc (answer):", err);
        }
      }
    });

    socket.on("ice-candidate", async ({ from, candidate }: { from: string; candidate: RTCIceCandidateInit }) => {
      const pc = peerConnections.current[from];
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ice candidate:", err);
        }
      }
    });

    socket.on("user-left", ({ socketId }: { socketId: string }) => {
      console.log("user-left:", socketId);
      if (peerConnections.current[socketId]) {
        peerConnections.current[socketId].close();
        delete peerConnections.current[socketId];
      }
      setPeers((prev) => {
        const copy = { ...prev };
        delete copy[socketId];
        return copy;
      });
    });

    // cleanup on unmount
    return () => {
      console.log("Cleaning up VideoRoom");
      // close peer connections
      Object.values(peerConnections.current).forEach((pc) => {
        try {
          pc.close();
        } catch (err) {}
      });
      peerConnections.current = {};
      // stop local tracks
      if (localStream.current) {
        localStream.current.getTracks().forEach((t) => t.stop());
        localStream.current = null;
      }
      // disconnect socket
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  function toggleMic() {
    if (!localStream.current) return;
    localStream.current.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMicOn((s) => !s);
  }

  function toggleCam() {
    if (!localStream.current) return;
    localStream.current.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setCamOn((s) => !s);
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <div className="font-bold mb-1">You</div>
        <video ref={localVideoRef} autoPlay playsInline muted className="w-48 h-36 bg-black" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(peers).map(([id, stream]) => (
          <div key={id}>
            <div className="font-semibold text-xs mb-1">Participant: {id}</div>
            <video
              autoPlay
              playsInline
              className="w-48 h-36 bg-black"
              ref={(el) => {
                if (el && stream) {
                  if (el.srcObject !== stream) el.srcObject = stream;
                }
              }}
            />
          </div>
        ))}
      </div>

      <div className="flex space-x-4 mt-4">
        <button onClick={toggleMic} className="p-2 bg-gray-800 text-white rounded">
          {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
        </button>
        <button onClick={toggleCam} className="p-2 bg-gray-800 text-white rounded">
          {camOn ? <FaVideo /> : <FaVideoSlash />}
        </button>
      </div>
    </div>
  );
}
