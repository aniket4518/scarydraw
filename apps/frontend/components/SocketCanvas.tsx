"use client"
import { useEffect, useState } from "react";
import Canva from "./Canva";
import { ws_backend } from "@/config";
import { getCsrfToken } from "next-auth/react";

export default async function SocketCanvas({ roomId }: { roomId: number }) {
    //ws connection 
   const session = await ();
  const token =  
    const [socket, setSocket] = useState<WebSocket | null>(null)
    console.log("from socket canvas", roomId)
    useEffect(()=>{
     const ws = new WebSocket(`${ws_backend}`)
        ws.onopen = () => {
            setSocket(ws)
            ws.send(JSON.stringify({
                type:"join_room",
                roomId
            }))
        }
        return () => {
            ws.close()
        }
    },[roomId])
 if (!socket){
    return (
        <div> 
            connecting to ws server ........
        </div>
    );
}

 

 
return (
    <>
        <Canva roomId={roomId} />
    </>
);

}
 