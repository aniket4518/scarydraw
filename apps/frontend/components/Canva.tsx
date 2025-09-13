"use client"
import { useEffect, useRef, useState } from "react";
import drawpage, { tools } from "./draw";
import { Circle, Icon, PencilIcon, RectangleVerticalIcon } from "lucide-react";
import IconButton from "./Icon";

export default function Canva({ roomId, socket }: {
  roomId: number
  socket: WebSocket
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool,settool]=useState<tools>(tools.ERASER)   
       
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    console.log("Canva useEffect triggered", {
      hasCanvas: !!canvasRef.current,
      hasSocket: !!socket,
      socketReadyState: socket?.readyState,
      roomId,
      currentTool: tools[tool]
    });
    
    if (canvasRef.current && socket && socket.readyState === WebSocket.OPEN) {
      const canvas = canvasRef.current;
      
      const cleanupPromise = drawpage(canvas, roomId, socket, tool);
      cleanupPromise.then((cleanupFn) => {
        cleanup = cleanupFn;
         
      }).catch((error) => {
        console.error("Error setting up drawpage:", error);
      });
    }
    
    // Cleanup function
    return () => {
    
      if (cleanup) {
        cleanup();
    
      }
    };
  }, [socket, roomId, tool]);  
    
  return (
    <>
      <canvas ref={canvasRef} className="w-full h-full border border-gray-200 absolute" />

     <div className="fixed top-5 left-180  inline-flex bg-slate-100  boder-double border shadow-xs   hover:bg-sky-200  " >
       <IconButton 
         icon={<PencilIcon size={34}/>} 
         onClick={() => { 
           
           settool(tools.FREEHAND);
         }} 
         tool={tool} 
       />
       <IconButton 
         icon={<Circle size={34} />} 
         onClick={() => {  
           settool(tools.CIRCLE); 
         }} 
         tool={tool} 
       />
       <IconButton 
         icon={<RectangleVerticalIcon size={34}/> } 
         onClick={() => { 
            settool(tools.RECT); 
         }} 
         tool={tool} 
       />
     </div>

     
    </>
  )
}