import {  WebSocketServer,WebSocket} from 'ws';
import Jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_SCERET} from "@repo/common/environment";
 import {prismaclient} from "@repo/db/client";
  

const wss = new WebSocketServer({ port: 8080 });
interface User {
    userid :string ,
    rooms:string [],
    ws :WebSocket
}
const users :User[]=[]
function connection (token:string): string | null{
    try {
    const decoded = Jwt.verify(token, JWT_SCERET) as JwtPayload;
    
    if (typeof decoded === 'string' || !decoded || !decoded.userId) {
       
      return null;
    }
    
    console.log('New client connected with userId:', decoded.userId);

    // You can return a string here if needed, for now returning userId as string
    return decoded.userId as string;
    
  } catch (error) {
      
    return null;
  }

}
 
wss.on('connection', (ws, request) => {
  const url = request.url;
  if(!url){
     
    return;
  }
  
  const queryParams = new URLSearchParams(url.split('?')[1] || '');
  const token = queryParams.get('token') || "";
  console.log("token",token)
  const userid=  connection (token)
   if (!userid){
    ws.close() 
    return null
   }
   users.push({
    userid,
    rooms:[],
     ws  
   })
   ws.on ('message', async function message(data){
    //send the parssed data or user given data to the server on the basis of types
    const newdata = JSON.stringify(data)
    const parssedData = JSON.parse(newdata)
    if (parssedData.type==="join_room"){
        const user = users.find(u => u.ws === ws)
        if(user){
            user.rooms.push(parssedData.roomId)
        }
    }
     if (parssedData.type==="leave"){
        const user = users.find(u => u.ws === ws)
        if(!user){
          return 
        }
      user.rooms =  user?.rooms.filter(u=>u !== parssedData.roomId)
    }
    if(parssedData.type==="chat"){
      const roomId =parssedData.roomId
      const message = parssedData.message
       await  prismaclient.chat.create({
        data:{
          userId:userid,
          roomId,
          message
        }
      })
        users.forEach(user => {
      if (user.rooms.includes(roomId)) {
        user.ws.send(JSON.stringify({
           type: "chat",
            roomId,
             message }))
      }
    })
    }
   
})

});
 
console.log('WebSocket server is running on port 8080');
