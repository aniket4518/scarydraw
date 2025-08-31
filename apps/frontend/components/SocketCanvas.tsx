"use client"
import { useEffect, useState } from "react";
import Canva from "./Canva";
import { ws_backend } from "@/config";

export default function SocketCanvas({roomId}:{
    roomId :number
}){
    //ws connection 
    const [socket,setsocket]=useState <WebSocket | null>(null)
    console.log(roomId)
    useEffect(()=>{
     const ws = new WebSocket(`${ws_backend}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4NWFmYzhkMi1lNzdiLTRhNjktODQ3Mi0xNjRjNzdjZGE4YzIiLCJpYXQiOjE3NTYyMTk3MTh9.e4STVWuRZMvJvxAFBmEv2Lhf1fqBODz8GaI3XeQzY4Y`)
        ws.onopen=() =>{
            setsocket(ws)
            ws.send(JSON.stringify({
                type:"join_room",
                roomId
            }
            ))
        }
    },[])
 if (!socket){
    return (
        <div> 
            connecting to ws server ........
        </div>
    );
}

return (
    <>
        <Canva roomId={roomId} socket={socket} />
    </>
);

}
 