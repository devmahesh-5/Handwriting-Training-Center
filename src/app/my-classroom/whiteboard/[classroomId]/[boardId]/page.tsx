"use client";
import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import {useSelector} from 'react-redux';
import { MdBackspace, MdBrush,MdClear, MdRemove } from "react-icons/md";

type Stroke = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  color?: string;
  thickness?: number;
  isEraser?: boolean;
};

export default function BoardPage({ params }: { params: Promise<{ classroomId: string, boardId: string }> }) {
  const userData = useSelector((state: { auth: { status: boolean; userData: userData; }; }) => state.auth.userData);
  const { boardId } = React.use(params);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const socketRef = useRef<Socket | null>(null);
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
  // drawStrokeOnCanvas now saves/restores ctx state and always clears line dash
  const drawStrokeOnCanvas = (stroke: Stroke, emit = false) => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    ctx.save(); // keep previous state

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = stroke.thickness ?? 2;
    ctx.strokeStyle = stroke.color ?? "black";
    ctx.setLineDash([]); // ensure solid line

    // If eraser, draw using destination-out so it truly erases pixels
    if (stroke.isEraser) {
      ctx.globalCompositeOperation = "destination-out";
    } else {
      ctx.globalCompositeOperation = "source-over";
    }

    // Draw a short quadratic curve between points instead of a tiny single-pixel segment.
    // This helps remove "dashed" appearance when many small segments arrive from remote clients.
    ctx.beginPath();
    ctx.moveTo(stroke.x0, stroke.y0);

    // Use midpoint smoothing for a nicer continuous appearance
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
    // emit at most every 20ms, but always draw locally immediately
    drawStrokeOnCanvas(stroke, now - lastEmitAtRef.current > 0);
    if (now - lastEmitAtRef.current > 20) {
      lastEmitAtRef.current = now;
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
      // canvas.width/height are in device pixels
      canvas.width = Math.round(w * ratio);
      canvas.height = Math.round(h * ratio);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Map CSS pixels to device pixels so we can draw using CSS coordinates
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
        const board = res.data.whiteboard[0];
        if (mounted && Array.isArray(board.drawing)) {
          for (const s of board.drawing) drawStrokeOnCanvas(s as Stroke, false);
        }

        // Connect socket (adjust path/URL if your server uses a different endpoint)
        const socket = io({ path: "/socketio" });
        socketRef.current = socket;

        socket.on("connect", () => {
          console.log("Socket connected:", socket.id);
          socket.emit("join-board", boardId);
        });

        // Remote drawing segments
        socket.on("drawing", (payload: { stroke: Stroke }) => {
          // payload might be just the stroke depending on your server implementation
          const stroke = (payload && (payload.stroke ?? payload)) as Stroke;
          drawStrokeOnCanvas(stroke, false);
        });

        // Clear board event from server (broadcast by whoever pressed Clear)
        socket.on("clear-board", () => {
          const canvas = canvasRef.current!;
          const ctx = ctxRef.current!;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        });

        socket.on("disconnect", () => console.log("Socket disconnected"));

        setIsLoaded(true);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error loading board");
      }
    }

    init();

    return () => {
      mounted = false;
      socketRef.current?.disconnect();
    };
  }, [boardId]);

  // --- Mouse/touch ---
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
          Board id: <strong>{boardId.slice(16,-1)}</strong>
        </div>
        { 
        userData?.role === "Teacher" &&( 
            <div className="flex gap-4">
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
    className={`flex items-center justify-center px-4 py-2 rounded-md transition-colors ${isEraser ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
  >
    {!isEraser ? (
      <>
        <MdBrush className="mr-2" /> {/* Brush icon when in eraser mode */}
        Brush
      </>
    ) : (
      <>
        <MdBackspace className="mr-2" /> {/* Eraser icon when in brush mode */}
        Eraser
      </>
    )}
  </button>
        
        </div>
        )
}
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
    </div>
  );
}

