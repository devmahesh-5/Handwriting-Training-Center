import { useEffect, useRef, useState } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from "react-icons/fa";
import { io, Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import axios from "axios";

type PeerInfo = {
  stream: MediaStream;
  name?: string;
};


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
  name: string;
}

interface AllUsersPayload {
  users: { socketId: string; name: string }[];
}


interface UserLeftPayload {
  socketId: string;
}

export default function VideoRoom({ roomId, userId }: { roomId: string; userId?: string }) {

  const userData: userData = useSelector((state: { auth: { status: boolean; userData: userData; }; }) => state.auth.userData);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerConnections = useRef<PeerMap>({});
  const localStream = useRef<MediaStream | null>(null);

  const [peers, setPeers] = useState<{ [socketId: string]: PeerInfo }>({});

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  useEffect(() => {
  if (!roomId) return;

  const socket = io("https://signaling-server-for-ht-center.onrender.com", {
    path: "/socketio",
    transports: ["websocket", "polling"],
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });
  socketRef.current = socket;

  const init = async () => {
    try {
      // Ping server first
      await axios.get("https://signaling-server-for-ht-center.onrender.com/ping");

      // Wait for socket connection
      await new Promise<void>((resolve) => socket.on("connect", () => resolve()));

      // Get local media
      localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = localStream.current;

      // Join room
      socket.emit("join-call-room", { roomId, name: userData.fullName });
    } catch (err) {
      console.error("Initialization failed:", err);
      return;
    }
  };

  init();

  // --- Peer Connection Creation ---
  const createPeerConnection = (remoteId: string) => {
    if (peerConnections.current[remoteId]) return peerConnections.current[remoteId];

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    // Add local tracks
    localStream.current?.getTracks().forEach(track => pc.addTrack(track, localStream.current as MediaStream));

    // Handle remote tracks
    pc.ontrack = (ev) => {
      const remoteStream = ev.streams[0];
      setPeers(prev => ({
        ...prev,
        [remoteId]: { ...prev[remoteId], stream: remoteStream },
      }));
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit("ice-candidate", {
          to: remoteId,
          from: socketRef.current.id,
          candidate: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
        delete peerConnections.current[remoteId];
        setPeers(prev => {
          const copy = { ...prev };
          delete copy[remoteId];
          return copy;
        });
      }
    };

    peerConnections.current[remoteId] = pc;
    return pc;
  };

  // --- Socket Event Handlers ---
  const handleAllUsers = async ({ users }: AllUsersPayload) => {
    for (const { socketId, name } of users) {
      setPeers(prev => ({ ...prev, [socketId]: { ...prev[socketId], name } }));
      const pc = createPeerConnection(socketId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", { to: socketId, from: socket.id, offer });
    }
  };

  const handleUserJoined = ({ socketId, name }: UserJoinedPayload) => {
    setPeers(prev => ({ ...prev, [socketId]: { ...prev[socketId], name } }));
    createPeerConnection(socketId);
  };

  const handleOffer = async ({ from, offer }: OfferPayload) => {
    const pc = createPeerConnection(from);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit("answer", { to: from, from: socket.id, answer });
  };

  const handleAnswer = async ({ from, answer }: AnswerPayload) => {
    const pc = peerConnections.current[from];
    if (!pc) return;
    if (pc.signalingState !== "have-local-offer") {
      await pc.setLocalDescription({ type: "rollback" });
    }
    await pc.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleIceCandidate = async ({ from, candidate }: IceCandidatePayload) => {
    const pc = peerConnections.current[from];
    if (pc && candidate) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("ICE candidate error:", err);
      }
    }
  };

  const handleUserLeft = ({ socketId }: UserLeftPayload) => {
    const pc = peerConnections.current[socketId];
    if (pc) pc.close();
    delete peerConnections.current[socketId];
    setPeers(prev => {
      const copy = { ...prev };
      delete copy[socketId];
      return copy;
    });
  };

  // --- Attach handlers ---
  socket.on("all-users", handleAllUsers);
  socket.on("user-joined", handleUserJoined);
  socket.on("offer", handleOffer);
  socket.on("answer", handleAnswer);
  socket.on("ice-candidate", handleIceCandidate);
  socket.on("user-left", handleUserLeft);

  // --- Cleanup ---
  return () => {
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};
    localStream.current?.getTracks().forEach(t => t.stop());
    socketRef.current?.disconnect();
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
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col items-center cursor-pointer">
        <div className="font-bold mb-1 text-lg text-gray-800 dark:text-gray-200">{userData.fullName}</div>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-32 h-24 sm:w-48 sm:h-36 bg-black rounded transform scale-x-[-1]"
        />
        <div className="flex space-x-4 mt-4">
          <button onClick={toggleMic} className="p-2 bg-gray-800 text-white rounded">
            {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
          </button>
          <button onClick={toggleCam} className="p-2 bg-gray-800 text-white rounded">
            {camOn ? <FaVideo /> : <FaVideoSlash />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {Object.entries(peers).map(([id, peer]) => (
          <div
            key={id}
            className="flex flex-col items-center cursor-pointer"
            onClick={(e) => {
              const video = e.currentTarget.querySelector("video");
              if (!video) return;

              if (document.fullscreenElement) {
                document.exitFullscreen();
              } else {
                video.requestFullscreen().catch((err) =>
                  console.warn("Failed to enter fullscreen:", err)
                );
              }
            }}

          >
            <div className="font-semibold text-xs text-gray-600 mb-1">
              {peer.name || `Participant: ${id}`}
            </div>
            <video
              autoPlay
              playsInline
              className="w-32 h-24 sm:w-48 sm:h-36 bg-black rounded transform scale-x-[-1]"
              ref={(el) => {
                if (!el) return;
                if (peer.stream && el.srcObject !== peer.stream) {
                  el.srcObject = peer.stream;
                  el.onloadedmetadata = () => {
                    el.play().catch((err) => console.warn("video.play() failed:", err));
                  };
                }
              }}
            />
          </div>
        ))}
      </div>




    </div>
  );
}
