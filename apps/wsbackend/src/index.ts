import {  WebSocketServer,WebSocket} from 'ws';
import Jwt, { JwtPayload } from "jsonwebtoken"
 
 import {prismaclient} from "@repo/db/client";
  

// messageTypes.ts
export type Message =
  | {
      type: "RECT";
      startX: number;
      startY: number;
      width: number;
      height: number;
      color?: string;
    }
  | {
      type: "CIRCLE";
      startX: number;
      startY: number;
      radius: number;
      color?: string;
    }
  | {
      type: "LINE";
      startX: number;
      startY: number;
      width: number;
      height: number;
      color?: string;
    }
  | {
      type: "FREEHAND";
      startX: number;
      startY: number;
      points: [number, number][];
      color?: string;
    }
  | {
      type: "TEXT";
      startX: number;
      startY: number;
      content: string;
      color?: string;
    };


const wss = new WebSocketServer({ port: 8080 });
interface User {
     email:string ,
    rooms:string [],
    ws :WebSocket
}

 
const users :User[]=[]
const NEXTAUTH_SECRET=process.env.NEXTAUTH_SECRET! || "ihaveasecretpasssword"
console.log("this is secret",NEXTAUTH_SECRET)
function connection (token:string): string | null{
    try {
       
    if (!NEXTAUTH_SECRET) {
      // secret not configured
      console.log("didn't get the secret")
      return null;
    }

    if (!token) {
      console.log("not get the token")
      return null;
    }
       
    const decoded = Jwt.verify(token, NEXTAUTH_SECRET) as JwtPayload | string;
    console.log("this is decoded",decoded)
    if (typeof decoded === 'string' || !decoded || !(decoded as JwtPayload).email) {
       
      return null;
    }
     
     
    return (decoded as JwtPayload).email as string;
    
  } catch (error) {
      
    return null;
  }

}
 
wss.on('connection', (ws, request) => {
  const url = request.url;
  console.log("this is url",url)
  if(!url){
     console.log("no url")
    return;
  }
  
  const queryParams = new URLSearchParams(url.split('?')[1] || '');
  const token = queryParams.get('token') || "";
  console.log(token)
  const email=  connection (token)
   
   if (!email){
    console.log("no email found")
    ws.close() 
    return null
   }
   users.push({
    email,
    rooms:[],
     ws  
   })
    
   ws.on ('message', async function message(data){
    //send the parssed data or user given data to the server on the basis of types

    const parssedData =  JSON.parse(data as unknown as string);
    if (!parssedData) return;
    if (parssedData.type === "join_room") {
        const user = users.find(x => x.ws === ws)
        if (user) {
          console.log(` User ${user.email} joining room ${parssedData.roomId}`)
          // Convert to string for consistent comparison
          const roomIdStr = parssedData.roomId.toString()
          if (!user.rooms.includes(roomIdStr)) {
            user.rooms.push(roomIdStr)
          }
          console.log(` User ${user.email} is now in rooms:`, user.rooms)
        } else {
          console.log(" User not found when trying to join room")
        }
    }
    

    if (parssedData.type === "leave") {
        const user = users.find(u => u.ws === ws)
        if (!user) {
            return
        }
      user.rooms =  user?.rooms.filter(u=>u !== parssedData.roomId)
    }
    if(parssedData.type==="chat"){
     const roomId   = Number (parssedData.roomId )  ;
       const message   = parssedData.message  ;
       
       // Find the user sending the message
       const currentUser = users.find(u => u.ws === ws);
       if (!currentUser) {
         console.log("User not found");
         return;
       }
       
       // Find user in database
       const dbUser = await prismaclient.user.findFirst({
         where: { email: currentUser.email }
       });
       
       if (!dbUser) {
         console.log("Database user not found");
         return;
       }

       // Find or create chat for this user and room
       let chat = await prismaclient.chat.findFirst({
         where: {
           roomId: roomId,
           userId: dbUser.id
         }
       });

       if (!chat) {
         chat = await prismaclient.chat.create({
           data: {
             roomId: roomId,
             userId: dbUser.id
           }
         });
       }

       const newmessage = await prismaclient.message.create({
        data: {
        type: message.type,
        startX: message.startX,
        startY: message.startY,
        width: "width" in message ? message.width : undefined,
        height: "height" in message ? message.height : undefined,
        radius: "radius" in message ? message.radius : undefined,
        points: "points" in message ? message.points : undefined,
        content: "content" in message ? message.content : undefined,
        color: "color" in message ? message.color : undefined,
        chatId: chat.id
      }
        })
      users.forEach(user => {
      if (user.rooms.includes(roomId.toString())) {
        console.log(`📤 Sending message to user: ${user.email} in room: ${roomId}`)
        try {
         
          user.ws.send(JSON.stringify({
             type: "chat",
                roomId,
                message: newmessage  // Send original message, not newmessage from DB
              }))
          console.log(" Message sent successfully")
        } catch (error) {
          console.error(" Error sending message to user:", error)
        }
      } else {
        console.log(` User ${user.email} not in room ${roomId}. User rooms:`, user.rooms)
      }
    })
    }
   
})

});
 
console.log('WebSocket server is running on port 8080');
