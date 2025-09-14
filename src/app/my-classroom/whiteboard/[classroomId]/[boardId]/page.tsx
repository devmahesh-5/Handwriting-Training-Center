"use client";
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client"; // named import (reliable)
import axios, { AxiosError } from "axios";
import { useSelector } from "react-redux";
import { MdBackspace, MdBrush } from "react-icons/md";
import VideoRoom from "@/components/Videoroom";

type Stroke = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  color?: string;
  thickness?: number;
  isEraser?: boolean;
};

// type userData = { role?: string; _id?: string };

export default function BoardPage({ params }: { params: Promise<{ classroomId: string; boardId: string }> }) {
  const userData = useSelector((state: { auth: { status: boolean; userData: userData; } }) => state.auth.userData);
  
  const { boardId } = React.use(params) as unknown as { boardId: string };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Use ReturnType<typeof io> for socket typing to avoid Socket export issues
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  const drawingRef = useRef<boolean>(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const lastEmitAtRef = useRef(0);
  const [isTeacher, setIsTeacher] = useState(userData?.role === "Teacher");
  const [color, setColor] = useState("#000000");
  const [thickness, setThickness] = useState(2);
  const [isEraser, setIsEraser] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Draw stroke on canvas ---
  const drawStrokeOnCanvas = (stroke: Stroke, emit = false) => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    ctx.save();

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = stroke.thickness ?? 2;
    ctx.strokeStyle = stroke.color ?? "black";
    ctx.setLineDash([]);

    ctx.globalCompositeOperation = stroke.isEraser ? "destination-out" : "source-over";

    ctx.beginPath();
    ctx.moveTo(stroke.x0, stroke.y0);
    const midX = (stroke.x0 + stroke.x1) / 2;
    const midY = (stroke.y0 + stroke.y1) / 2;
    ctx.quadraticCurveTo(stroke.x0, stroke.y0, midX, midY);
    ctx.lineTo(stroke.x1, stroke.y1);
    ctx.stroke();
    ctx.closePath();

    ctx.restore();

    if (emit && socketRef.current?.connected) {
      socketRef.current.emit("drawing", { boardId, stroke });
    }
  };

  // --- Throttle drawing ---
  const emitStrokeThrottled = (stroke: Stroke) => {
    const now = Date.now();
    // draw locally always
    drawStrokeOnCanvas(stroke, false);
    // emit at most every 20ms
    if (now - lastEmitAtRef.current > 0) {
      lastEmitAtRef.current = now;
      if (socketRef.current?.connected) {
        socketRef.current.emit("drawing", { boardId, stroke });
      }
    }
  };

  // --- Canvas init ---
  useEffect(() => {
    const canvas = canvasRef.current!;
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const parent = canvas.parentElement ?? document.body;
      const w = Math.max(800, parent.clientWidth - 40);
      const h = Math.max(600, window.innerHeight - 200);
      canvas.width = Math.round(w * ratio);
      canvas.height = Math.round(h * ratio);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctxRef.current = ctx;
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // --- Load board & socket ---
  useEffect(() => {
    if (!boardId) return;
    let mounted = true;

    async function init() {
      setError(null);
      try {
        // Fetch existing strokes
        const res = await axios.get(`/api/whiteboard/${boardId}`);
        const board = Array.isArray(res.data.whiteboard) ? res.data.whiteboard[0] : res.data.whiteboard;
        if (mounted && Array.isArray(board?.drawing)) {
          for (const s of board.drawing) drawStrokeOnCanvas(s as Stroke, false);
        }

        // create socket inside effect (and type it with ReturnType<typeof io>)
        const socket = io("https://handwriting-training-center.vercel.app/", { path: "/socketio", transports: ["websocket", "polling"] });
        socketRef.current = socket;

        socket.on("connect", () => {
          console.log("Socket connected:", socket.id);
          socket.emit("join-board", boardId);
        });

        socket.on("drawing", (payload: { stroke: Stroke }) => {
          const stroke = (payload && (payload.stroke ?? payload)) as Stroke;
          drawStrokeOnCanvas(stroke, false);
        });

        socket.on("clear-board", () => {
          const canvas = canvasRef.current!;
          const ctx = ctxRef.current!;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        });

        socket.on("disconnect", () => console.log("Socket disconnected"));

        setIsLoaded(true);
      } catch (err: unknown) {
        if(err instanceof AxiosError){
          setError(err.response?.data?.message || err.message);
        }else{
          setError(err as string);
        }
      }
    }

    init();

    return () => {
      mounted = false;
      // cleanup socket
      try {
        socketRef.current?.disconnect();
      } catch (e) {}
      socketRef.current = null;
    };
  }, [boardId]);

  // --- Pointer handlers ---
  const getPointer = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const t = e.touches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    } else {
      return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
    }
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    drawingRef.current = isTeacher;
    lastPosRef.current = getPointer(e);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawingRef.current || !lastPosRef.current) return;
    const pos = getPointer(e);
    const stroke: Stroke = {
      x0: lastPosRef.current.x,
      y0: lastPosRef.current.y,
      x1: pos.x,
      y1: pos.y,
      color,
      thickness,
      isEraser,
    };
    emitStrokeThrottled(stroke);
    lastPosRef.current = pos;
  };

  const handlePointerUp = () => {
    drawingRef.current = false;
    lastPosRef.current = null;
  };

  return (
    <div style={{ padding: 12 }}>
      <header style={{ display: "flex", gap: 12, marginBottom: 8 }}>
        <div>
          Board id: <strong>{boardId?.slice(0, 8) ?? "—"}</strong>
        </div>
        {userData?.role === "Teacher" && (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <label>
              Color
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ marginLeft: 6 }} />
            </label>
            <label>
              Thickness
              <input type="range" min={1} max={30} value={thickness} onChange={(e) => setThickness(Number(e.target.value))} />
            </label>
            <button
              onClick={() => setIsEraser(!isEraser)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                background: isEraser ? "#fee2e2" : "#e0e7ff",
                color: isEraser ? "#b91c1c" : "#3730a3",
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              {!isEraser ? (
                <>
                  <MdBrush />
                  Brush
                </>
              ) : (
                <>
                  <MdBackspace />
                  Eraser
                </>
              )}
            </button>
          </div>
        )}
      </header>

      {error && <div style={{ color: "red" }}>{error}</div>}

      <div style={{ border: "1px solid #ccc", display: "inline-block" }}>
        <canvas
          ref={canvasRef}
          style={{ touchAction: "none", display: "block", background: "white" }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <VideoRoom roomId="room1" userId={Date.now().toString()} />
      </div>
    </div>
  );
}
