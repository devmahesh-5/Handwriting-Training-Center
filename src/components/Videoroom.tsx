import { useEffect, useRef, useState } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from "react-icons/fa";
import { io, Socket } from "socket.io-client";

type PeerMap = { [socketId: string]: RTCPeerConnection };
type StreamsMap = { [socketId: string]: MediaStream };

// Socket event types
interface OfferPayload {
  from: string;
  offer: RTCSessionDescriptionInit;
}

interface AnswerPayload {
  from: string;
  answer: RTCSessionDescriptionInit;
}

interface IceCandidatePayload {
  from: string;
  candidate: RTCIceCandidateInit;
}

interface UserJoinedPayload {
  socketId: string;
}

interface AllUsersPayload {
  users: string[];
}

interface UserLeftPayload {
  socketId: string;
}

export default function VideoRoom({ roomId, userId }: { roomId: string; userId?: string }) {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerConnections = useRef<PeerMap>({});
  const localStream = useRef<MediaStream | null>(null);

  const [peers, setPeers] = useState<StreamsMap>({});
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  useEffect(() => {
    const socket = io("https://signaling-server-for-ht-center.onrender.com", {
      path: "/socketio",
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    // --- Get user media ---
    async function startLocal() {
      try {
        localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = localStream.current;
        socket.emit("join-call-room", { roomId });
      } catch (err) {
        console.error("Could not get user media:", err);
      }
    }
    startLocal();

    function createPeerConnection(remoteId: string) {
      if (peerConnections.current[remoteId]) return peerConnections.current[remoteId];
      console.log("Creating peer connection", remoteId);
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      // Add local tracks
      localStream.current?.getTracks().forEach((track) => pc.addTrack(track, localStream.current as MediaStream));

      pc.ontrack = (ev) => {
        const remoteStream = ev.streams[0];
        setPeers((prev) => ({ ...prev, [remoteId]: remoteStream }));
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("ice-candidate", {
            to: remoteId,
            from: socketRef.current.id,
            candidate: event.candidate,
          } as IceCandidatePayload & { to: string });
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "disconnected" || pc.connectionState === "failed" || pc.connectionState === "closed") {
          delete peerConnections.current[remoteId];
          setPeers((prev) => {
            const copy = { ...prev };
            delete copy[remoteId];
            return copy;
          });
        }
      };

      peerConnections.current[remoteId] = pc;
      return pc;
    }

    // --- Socket events ---
    socket.on("all-users", async ({ users }: AllUsersPayload) => {
      console.log("All users:", users);
      for (const remoteId of users) {
        const pc = createPeerConnection(remoteId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { to: remoteId, from: socket.id, offer });
      }
    });

    socket.on("user-joined", async ({ socketId }: UserJoinedPayload) => {
      console.log("User joined:", socketId);
      const pc = createPeerConnection(socketId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", { to: socketId, from: socket.id, offer });
    });

    socket.on("offer", async ({ from, offer }: OfferPayload) => {
      console.log("Received offer from:", from);
      const pc = createPeerConnection(from);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { to: from, from: socket.id, answer });
      console.log("Sending answer to:", from);
    });

    socket.on("answer", async ({ from, answer }: AnswerPayload) => {
      console.log("Received answer from:", from);
      const pc = peerConnections.current[from];
      if (!pc) return;
      if (pc.signalingState === "stable") {
        console.warn("PC is already stable; cannot set remote description now.");
        return;
      }
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log("Answer set successfully");
      } catch (err) {
        console.error("Error setting remote description:", err);
      }
    });

    socket.on("ice-candidate", async ({ from, candidate }: IceCandidatePayload) => {
      console.log("Received ICE candidate from:", from);
      const pc = peerConnections.current[from];
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("ICE candidate added successfully");
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      }
    });

    socket.on("user-left", ({ socketId }: UserLeftPayload) => {
      const pc = peerConnections.current[socketId];
      if (pc) pc.close();
      delete peerConnections.current[socketId];
      setPeers((prev) => {
        const copy = { ...prev };
        delete copy[socketId];
        return copy;
      });
    });

    // --- Cleanup ---
    return () => {
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      peerConnections.current = {};
      localStream.current?.getTracks().forEach((t) => t.stop());
      if (socketRef.current) socketRef.current.disconnect();
      socketRef.current = null;
    };
  }, [roomId]);

  const toggleMic = () => {
    if (!localStream.current) return;
    localStream.current.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMicOn((s) => !s);
  };

  const toggleCam = () => {
    if (!localStream.current) return;
    localStream.current.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setCamOn((s) => !s);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <div className="font-bold mb-1">You</div>
        <video ref={localVideoRef} autoPlay playsInline muted className="w-48 h-36 bg-black" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(peers).map(([id, stream]) => (
          console.log(stream),
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
