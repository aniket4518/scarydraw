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
  const drawpageRef = useRef<{ setTool: (newTool: tools) => void } | null>(null);
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
     
    
    if (canvasRef.current && socket && socket.readyState === WebSocket.OPEN) {
      const canvas = canvasRef.current;
      
      const cleanupPromise = drawpage(canvas, roomId, socket, tool);
      cleanupPromise.then((result: any) => {
        // drawpage may resolve to a function or an object with cleanup/setTool
        if (typeof result === 'function') {
          cleanup = result;
        } else if (result && typeof result.cleanup === 'function') {
          cleanup = result.cleanup;
          drawpageRef.current = result;
        } else {
          // unexpected shape, try to attach setTool if present
          if (result && typeof result.setTool === 'function') {
            drawpageRef.current = result;
          } else {
            console.warn("Unexpected drawpage result:", result);
          }
        }
      }).catch((error) => {
        console.error("Error setting up drawpage:", error);
      });
    }
    
    // Cleanup function
    return () => {
    
      if (cleanup) {
        cleanup();
    
      }
       drawpageRef.current = null;
    };
  }, [socket, roomId]); 

   const handleToolChange = (newTool: tools) => {
    console.log("🔧 Changing tool to:", tools[newTool]);
    settool(newTool);
    
    // ✅ UPDATE TOOL INSIDE EXISTING DRAWPAGE INSTANCE
    if (drawpageRef.current && drawpageRef.current.setTool) {
      drawpageRef.current.setTool(newTool);
    }else{
      console.warn("drawpage not available")
    }
  }; 
    
  return (
    <>
      <canvas ref={canvasRef} className="w-full h-full border border-gray-200 absolute" />

     <div className="fixed top-5 left-180  inline-flex bg-slate-100  boder-double border shadow-lg rounded-full  hover:shadow-lg hover:shadow-sky-500/50  " >
       <IconButton 
         icon={<PencilIcon size={34} />} 
         onClick={() => { 
           handleToolChange(tools.FREEHAND)
         }} 
          tool={tool}
          currentTool={tool}        // ✅ PASS CURRENT TOOL
          toolType={tools.FREEHAND}
       />
       <IconButton 
         icon={<Circle size={34} />} 
         onClick={() => {  
           handleToolChange(tools.CIRCLE)
         }} 
         tool={tool} 
         currentTool={tool}        
          toolType={tools.CIRCLE}
       />
       <IconButton 
         icon={<RectangleVerticalIcon size={34}/> } 
         onClick={() => { 
           handleToolChange(tools.RECT)
         }} 
         tool={tool} 
         currentTool={tool}
         toolType={tools.RECT}
       />
       <IconButton 
         icon={<EraserIcon size={34}/> } 
         onClick={() => { 
            handleToolChange(tools.ERASER)
         }} 
         tool={tool} 
         currentTool={tool}        // ✅ PASS CURRENT TOOL
          toolType={tools.ERASER}
       />
     </div>

     
    </>
  )
}