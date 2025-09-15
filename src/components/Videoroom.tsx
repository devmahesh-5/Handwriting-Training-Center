import { useEffect, useRef, useState } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from "react-icons/fa";
import { io, Socket } from "socket.io-client";
import { useSelector } from "react-redux";

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
  const interval = setInterval(() => {
    fetch("https://signaling-server-for-ht-center.onrender.com/ping")
      .catch(() => console.warn("Server might be asleep"));
  }, 3 * 60 * 1000);

  return () => clearInterval(interval);
}, []);

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
        socket.emit("join-call-room", { roomId, name: userData.fullName });
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
        console.log("Received remote track from", remoteId, "stream:", remoteStream);
        remoteStream.getTracks().forEach(t => console.log(" → remote track", t.kind, "enabled:", t.enabled));
        // Save stream in state so React renders a video element for it
        setPeers(prev => ({
          ...prev,
          [remoteId]: { ...prev[remoteId], stream: remoteStream }
        }));

        // Also request stats for debugging (non-blocking)
        try {
          const pcForStats = pc;
          setTimeout(async () => {
            try {
              const receivers = pcForStats.getReceivers();
              for (const r of receivers) {
                const stats = await r.getStats();
                stats.forEach(report => {
                  if (report.type === "inbound-rtp") {
                    console.log("Inbound RTP stats for", remoteId, report);
                  }
                });
              }
            } catch (sErr) {
              console.warn("getStats failed", sErr);
            }
          }, 1000);
        } catch { }
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
      for (const { socketId: remoteId, name } of users) {
        setPeers(prev => ({
          ...prev,
          [remoteId]: { ...prev[remoteId], name }
        }));
        const pc = createPeerConnection(remoteId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { to: remoteId, from: socket.id, offer });
      }
    });

    socket.on("user-joined", ({ socketId, name }: UserJoinedPayload) => {
      console.log("User joined:", socketId);
      setPeers(prev => ({
        ...prev,
        [socketId]: { ...prev[socketId], name }
      }));
      createPeerConnection(socketId);
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
      const pc = peerConnections.current[from];
      if (!pc) return;
      try {
        if (pc.signalingState !== "have-local-offer") {
          console.warn("PeerConnection not in 'have-local-offer', applying rollback");
          await pc.setLocalDescription({ type: "rollback" });
        }
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log("Answer applied successfully");
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
