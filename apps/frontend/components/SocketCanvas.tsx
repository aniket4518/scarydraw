"use client"
import { useEffect, useState } from "react";
import Canva from "./Canva";
import { ws_backend } from "@/config";
import getWsToken from "./Gettoken";
import axios from "axios";

export default function SocketCanvas({ roomId }: { roomId: number }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ws: WebSocket;

    const setupSocket = async () => {
      try {
         
        const token = await getWsToken();
        console.log("token from socket canva", token);

        ws = new WebSocket(`${ws_backend}?token=${token}`);

        ws.onopen = () => {
          setSocket(ws);
          ws.send(
            JSON.stringify({
              type: "join_room",
              roomId,
            })
          );
          setLoading(false);
        };

        ws.onclose = () => {
          console.log("WebSocket closed");
        };
      } catch (error) {
        console.error("Error getting token or connecting socket:", error);
      }
    };

    setupSocket();

    return () => {
      if (ws) ws.close();
    };
  }, []);

  if (loading || !socket) {
    return <div>connecting to ws server ........</div>;
  }

  return <Canva roomId={roomId} socket={socket} />;
}
