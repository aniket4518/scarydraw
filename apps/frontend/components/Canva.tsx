"use client"
import { useEffect , useRef} from "react";
import drawpage from "./draw";
 
export default function  Canva ({roomId,socket} :{
  roomId:number
  socket:WebSocket
}){
    const canvasRef =  useRef<HTMLCanvasElement>(null);
       
      useEffect(() => {
        if (canvasRef.current){
          const canvas = canvasRef.current 
           drawpage(canvas,roomId,socket)
        }
      }, [canvasRef]);
    
  
  return (
   <>
      <canvas ref={canvasRef} className="w-full h-full border border-gray-400  absolute"></canvas>
    </>
  )
}