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
     const ws = new WebSocket(`${ws_backend}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4MjA5N2QzNC05Nzg3LTRlNzAtYTMwYi0yNDk3NmY3Nzk1ZDEiLCJpYXQiOjE3NTU3MTQ0Mzh9.c217BlZ0EA4ImDXEmZ1z6aJiq2e1gAxOjwtHW5_aFQE`)
        ws.onopen=() =>{
            setsocket(ws)
            ws.send(JSON.stringify({
                type:"join_room",
                roomId
            }
            ))
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
        <Canva roomId={roomId} socket={socket} />
    </>
);

}
 