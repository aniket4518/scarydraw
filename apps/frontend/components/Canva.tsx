"use client"
import { useEffect, useRef, useState } from "react";
import drawpage, { tools } from "./draw";
import { Circle, EraserIcon, Icon, PencilIcon, RectangleHorizontal, RectangleVerticalIcon } from "lucide-react";
import IconButton from "./Icon";

export default function Canva({ roomId, socket }: {
  roomId: number
  socket: WebSocket
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool,settool]=useState<tools>(tools.ERASER)   
  
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
     
    
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

     <div className="fixed top-5 left-180  inline-flex bg-slate-100  boder-double border shadow-lg rounded-full  hover:shadow-lg hover:shadow-sky-500/50  " >
       <IconButton 
         icon={<PencilIcon size={34} />} 
         onClick={() => { 
           
           settool(tools.FREEHAND);
         }} 
          tool={tool}
          currentTool={tool}        // ✅ PASS CURRENT TOOL
          toolType={tools.FREEHAND}
       />
       <IconButton 
         icon={<Circle size={34} />} 
         onClick={() => {  
           settool(tools.CIRCLE); 
         }} 
         tool={tool} 
         currentTool={tool}        // ✅ PASS CURRENT TOOL
          toolType={tools.CIRCLE}
       />
       <IconButton 
         icon={<RectangleVerticalIcon size={34}/> } 
         onClick={() => { 
            settool(tools.RECT); 
         }} 
         tool={tool} 
         currentTool={tool}
         toolType={tools.RECT}
       />
       <IconButton 
         icon={<EraserIcon size={34}/> } 
         onClick={() => { 
            settool(tools.ERASER); 
         }} 
         tool={tool} 
         currentTool={tool}        // ✅ PASS CURRENT TOOL
          toolType={tools.ERASER}
       />
     </div>

     
    </>
  )
}