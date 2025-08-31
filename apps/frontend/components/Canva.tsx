"use client"
import { useEffect , useRef} from "react";
import drawPage from "./draw";
export default function  Canva ({
  roomId,
  socket
}:{
  roomId:number
  socket:WebSocket  
}
 ){
    const canvasRef = useRef<HTMLCanvasElement>(null);
       
      useEffect(() => {
        if (canvasRef.current) {
         drawPage( canvasRef as React.RefObject<HTMLCanvasElement>,roomId, socket  );
        }
      }, [canvasRef]);
    
  
  return (
   <>
      <canvas ref={canvasRef} className="w-full h-full border border-gray-400  absolute"></canvas>
    </>
  )
}