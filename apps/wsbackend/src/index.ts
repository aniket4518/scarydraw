import {WebSocket, WebSocketServer} from 'ws';
import Jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_SCERET} from "@repo/common/environment";

const wss = new WebSocketServer({ port: 8080 });
 
wss.on('connection', (socket, request) => {
  const url = request.url;
  if(!url){
    socket.close();
    return;
  }
  
  const queryParams = new URLSearchParams(url.split('?')[1] || '');
  const token = queryParams.get('token') || "";
  
  try {
    const decoded = Jwt.verify(token, JWT_SCERET) as JwtPayload;
    
    if (typeof decoded === 'string' || !decoded || !decoded.userId) {
      socket.close();
      return;
    }
    
    console.log('New client connected with userId:', decoded.userId);

    socket.on('message', (message) => {
      console.log(`Received message: ${message}`);
    });

    socket.on('close', () => {
      console.log('Client disconnected');
    });
    
  } catch (error) {
    console.log('Invalid token:', error);
    socket.close();
    return;
  }
});

console.log('WebSocket server is running on port 8080');
