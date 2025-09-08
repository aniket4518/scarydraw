"use client"
import { useEffect, useRef } from "react";
import drawpage from "./draw";
 
export default function Canva({ roomId, socket }: {
  roomId: number
  socket: WebSocket
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
       
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    console.log("🎨 Canva useEffect triggered", {
      hasCanvas: !!canvasRef.current,
      hasSocket: !!socket,
      socketReadyState: socket?.readyState,
      roomId
    });
    
    if (canvasRef.current && socket && socket.readyState === WebSocket.OPEN) {
      const canvas = canvasRef.current;
      
      // Call drawpage and store cleanup function
      const cleanupPromise = drawpage(canvas, roomId, socket);
      cleanupPromise.then((cleanupFn) => {
        cleanup = cleanupFn;
        console.log("✅ Real-time drawing setup complete for room:", roomId);
      }).catch((error) => {
        console.error("❌ Error setting up drawpage:", error);
      });
    }
    
    // Cleanup function
    return () => {
      console.log("🧹 Canva cleanup for room:", roomId);
      if (cleanup) {
        cleanup();
      }
    };
  }, [socket, roomId]); // ✅ FIXED: Only include socket and roomId
    
  return (
    <>
      <canvas ref={canvasRef} className="w-full h-full border border-gray-400 absolute" />
    </>
  )
}