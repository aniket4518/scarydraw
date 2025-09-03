"use client"
import { useEffect , useRef} from "react";
import drawpage from "./draw";
 
export default function  Canva ({roomId}:{
  roomId:number
}){
    const canvasRef =  useRef<HTMLCanvasElement>(null);
       
      useEffect(() => {
        if (canvasRef.current){
          const canvas = canvasRef.current 
           drawpage(canvas,roomId)
        }
      }, [canvasRef]);
    
  
  return (
   <>
      <canvas ref={canvasRef} className="w-full h-full border border-gray-400  absolute"></canvas>
    </>
  )
}