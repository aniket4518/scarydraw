"use client";
import { useRef, useEffect } from "react";

export default function CanvasPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    drawing: false,
    startX: 0,
    startY: 0
  });

  useEffect(() => {
    const canvas = canvasRef.current;
     if (!canvas) return;
      function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.reset?.(); // if supported
      ctx.scale(dpr, dpr);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "black";
    }

    resize();
    window.addEventListener("resize", resize);
  
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function toCanvasCoords(e: PointerEvent) {
          if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }

    function onPointerDown(e: PointerEvent) {

      const { x , y   }  = toCanvasCoords(e);

      stateRef.current.drawing = true;
      stateRef.current.startX = x;
      stateRef.current.startY = y;
    }

    function onPointerUp() {
      stateRef.current.drawing = false;
    }

    function onPointerMove(e: PointerEvent) {
      if (!stateRef.current.drawing) return;
        if (!canvas) return;
      const { x, y } = toCanvasCoords(e);
      const w = x - stateRef.current.startX;
      const h = y - stateRef.current.startY;
       if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height); // clears scaled pixels
      ctx.strokeRect(stateRef.current.startX, stateRef.current.startY, w, h);
    }

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointerleave", onPointerUp);
    canvas.addEventListener("pointermove", onPointerMove);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointerleave", onPointerUp);
      canvas.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <div className="w-screen h-screen">
      <canvas ref={canvasRef} className="w-full h-full touch-none select-none" />
    </div>
  );
}