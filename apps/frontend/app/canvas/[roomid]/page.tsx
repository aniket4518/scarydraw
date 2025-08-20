 "use client";
import drawPage from "@/components/draw";
import { useRef, useEffect } from "react";

// enum Tool {
//   Pencil = "pencil",
//   Eraser = "eraser",
//   Line = "line",
//   Rectangle = "rectangle",
//   Circle = "circle",
//   Square = "square",
// }

export default function CanvasPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
     drawPage( canvasRef as React.RefObject<HTMLCanvasElement>);
    }
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="w-full h-full border border-gray-400  absolute"></canvas>
    </>
  );
}

 
 
 