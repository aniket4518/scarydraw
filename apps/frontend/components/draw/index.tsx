 import { Http_Backend } from "../../config"
import axios from 'axios'

export enum tools {
  RECT,
  CIRCLE,
  FREEHAND,
  ERASER
}

 
type Message = {
  id?: number                     
  type: "RECT" | "CIRCLE" | "FREEHAND" | "TEXT" | "LINE"
  startX: number
  startY: number
  width?: number                  
  height?: number               
  radius?: number                 
  points?: [number, number][]    
  content?: string              
  color?: string                 
  createdAt?: Date               
  chatId?: number               
}

export default async function drawpage(canvas: HTMLCanvasElement, roomId: number, socket: WebSocket, initalTool: tools) {
  
  let currentTool = initalTool
  // Clean up previous listeners
  if (!(canvas as any)._listeners) {
    (canvas as any)._listeners = []
  }
  
  ;(canvas as any)._listeners.forEach((listenerInfo: any) => {
    canvas.removeEventListener(listenerInfo.type, listenerInfo.handler)
  })
  ;(canvas as any)._listeners = []
  
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return () => {}  
  }
  
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
 
  // ✅ UNIFIED MESSAGES ARRAY - SAME TYPE AS DATABASE
  const messages: Message[] = []
  const deleted:Message[]=[]
  const Maxlength= 20
  
  console.log("📥 Loading existing messages from server...")
  
  // ✅ LOAD ALL EXISTING MESSAGES FROM SERVER - NO TYPE CONVERSION NEEDED!
  const existingMessagesFromServer = await getMessagesFromServer(roomId)

  if (existingMessagesFromServer && Array.isArray(existingMessagesFromServer)) {
    existingMessagesFromServer.forEach((msg: Message) => {
      console.log("📦 Loading message from server:", msg.type, "ID:", msg.id)
      messages.push(msg) // ✅ DIRECT PUSH - NO CONVERSION NEEDED!
    })
  }
  //message jo delete kiyeusko push kardena hain deleted main aur usme sai message from last ke 10 messageko delete karana hai with message id 
 async function addToDeleted (messagesToDelete:Message){
     deleted.unshift(messagesToDelete)

     //if  we reaches maxlength . Remove the oldest 
     if(deleted.length>Maxlength){
          const  oldest =deleted.pop()
          if(oldest && oldest.id){
            const messageId=oldest.id
           await  deleteFromServer(messageId)
          }
     }
 } 

  const setTool = (newTool: tools) => {
    console.log("🔧 Tool changed from", tools[currentTool], "to", tools[newTool]);
    currentTool = newTool;
  };

 
  // ✅ WEBSOCKET MESSAGE HANDLER - ADDS TO UNIFIED ARRAY
  const handleMessage = (event: MessageEvent) => {
    try {
      const socketMessage = JSON.parse(event.data)
      if (socketMessage.type === "chat" && socketMessage.message) {
        console.log("🔥 Received new message via WebSocket:", socketMessage.message.type)
        
        // ✅ ADD TO UNIFIED MESSAGES ARRAY - NO CONVERSION NEEDED!
        messages.push(socketMessage.message)
        
        // ✅ REDRAW ALL MESSAGES
        clearCanvas(canvas, ctx, messages)
        
        console.log("✅ Total messages now:", messages.length)
      }
    } catch (error) {
      console.error("❌ Error parsing WebSocket message:", error)
    }
  }

  socket.removeEventListener('message', handleMessage)
  socket.addEventListener('message', handleMessage)
   
  // ✅ INITIAL RENDER OF ALL MESSAGES
  clearCanvas(canvas, ctx, messages)
  console.log("🎨 Canvas rendered with", messages.length, "messages")
  
  let clicked = false
  let startx = 0
  let starty = 0
  let pencilPoints: [number, number][] = []  
  
  const handleMouseDown = (e: MouseEvent) => {
    clicked = true
    const rect = canvas.getBoundingClientRect()  
    startx = e.clientX - rect.left
    starty = e.clientY - rect.top
     
    if (currentTool === tools.FREEHAND) {
      pencilPoints = [[startx, starty]]
    } else if (currentTool === tools.ERASER) {
      console.log("🗑️ Eraser tool - checking for messages to delete...")
      
      // ✅ ERASE FROM UNIFIED MESSAGES ARRAY
      let deletedCount = 0
      for (let i = messages.length - 1; i >= 0; i--) {
        if (isInsideMessage(startx, starty, messages[i])) {
          console.log("🗑️ Deleting message:", messages[i].type, "ID:", messages[i].id)
          const messageToDelete=messages[i]
          messages.splice(i, 1)
           deletedCount++
          addToDeleted(messageToDelete)
        }
      }
      
      if (deletedCount > 0) {
        console.log("🗑️ Deleted", deletedCount, "messages")
        clearCanvas(canvas, ctx, messages)
      }
    } else {
      pencilPoints = []  
    }
  }

  const handleMouseUp = (e: MouseEvent) => {
    if (!clicked) return
    clicked = false

    const rect = canvas.getBoundingClientRect()  
    const endx = (e.clientX - rect.left)
    const endy = (e.clientY - rect.top)
    
    let newMessage: Message | null = null

    // ✅ SIMPLIFIED LOGIC - CREATE MESSAGE DIRECTLY
    if (currentTool=== tools.RECT) {
      const minX = Math.min(startx, endx)
      const minY = Math.min(starty, endy)
      const maxX = Math.max(startx, endx)
      const maxY = Math.max(starty, endy)
      
      newMessage = {
        type: "RECT",
        startX: minX,
        startY: minY,
        width: maxX - minX,
        height: maxY - minY
      }
    }
    else if (currentTool === tools.CIRCLE) {
      const radius = Math.sqrt(Math.pow(endx - startx, 2) + Math.pow(endy - starty, 2))
      newMessage = {
        type: "CIRCLE",
        startX: startx,
        startY: starty,
        radius: radius
      }
    }
    else if (currentTool === tools.FREEHAND) {
      if (pencilPoints.length === 0 || 
          pencilPoints[pencilPoints.length - 1][0] !== endx || 
          pencilPoints[pencilPoints.length - 1][1] !== endy) {
        pencilPoints.push([endx, endy])
      }
      
      newMessage = {
        type: "FREEHAND",
        startX: startx,
        startY: starty,
        points: [...pencilPoints] 
      }
    }

    if (newMessage) {
      console.log("🎨 Creating new message:", newMessage.type)
      
      // ✅ ADD TO UNIFIED MESSAGES ARRAY
      messages.push(newMessage)
      
      // ✅ REDRAW ALL MESSAGES
      clearCanvas(canvas, ctx, messages)
      
      console.log("✅ Total messages now:", messages.length)
      
      // ✅ SEND TO WEBSOCKET (WHICH SAVES TO DB)
      socket.send(JSON.stringify({
        type: "chat",
        message: newMessage,
        roomId
      }))
      
      console.log("📤 Message sent to server for DB storage")
    }
 
    if (currentTool === tools.FREEHAND) {
      pencilPoints = []
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (clicked) {
      const rect = canvas.getBoundingClientRect()  
      const currentx = (e.clientX - rect.left)  
      const currenty = (e.clientY - rect.top)  
      
      // ✅ REDRAW ALL EXISTING MESSAGES
      clearCanvas(canvas, ctx, messages)

      if (currentTool === tools.RECT) {
        const minX = Math.min(startx, currentx)
        const minY = Math.min(starty, currenty)
        const maxX = Math.max(startx, currentx)
        const maxY = Math.max(starty, currenty)
        
        ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
      } else if (currentTool === tools.CIRCLE) {
        const radius = Math.sqrt(Math.pow(currentx - startx, 2) + Math.pow(currenty - starty, 2));
        ctx.beginPath();
        ctx.arc(startx, starty, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (currentTool === tools.FREEHAND) {
        pencilPoints.push([currentx, currenty]);
        if (pencilPoints.length > 1) {
          ctx.beginPath();
          ctx.moveTo(pencilPoints[0][0], pencilPoints[0][1]);
          for (let i = 1; i < pencilPoints.length; i++) {
            ctx.lineTo(pencilPoints[i][0], pencilPoints[i][1]);
          }
          ctx.stroke();
        }
      }
    }
  }

  canvas.addEventListener("mousedown", handleMouseDown)
  canvas.addEventListener("mouseup", handleMouseUp)
  canvas.addEventListener("mousemove", handleMouseMove)
  
  ;(canvas as any)._listeners.push(
    { type: "mousedown", handler: handleMouseDown },
    { type: "mouseup", handler: handleMouseUp },
    { type: "mousemove", handler: handleMouseMove }
  )

  // ✅ UNIFIED CANVAS CLEARING FUNCTION - WORKS WITH MESSAGE TYPE
  function clearCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, allMessages: Message[]) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    allMessages.forEach((message) => {
      // ✅ SIMPLIFIED - NO MORE IF/ELSE CONVERSION NEEDED!
      if (message.type === "RECT" && message.width && message.height) {
        ctx.strokeRect(message.startX, message.startY, message.width, message.height)
      } else if (message.type === "CIRCLE" && message.radius) {
        ctx.beginPath()
        ctx.arc(message.startX, message.startY, message.radius, 0, Math.PI * 2)
        ctx.stroke()
      } else if (message.type === "FREEHAND" && message.points && message.points.length > 1) {
        ctx.beginPath()
        ctx.moveTo(message.points[0][0], message.points[0][1])
        for (let i = 1; i < message.points.length; i++) {
          ctx.lineTo(message.points[i][0], message.points[i][1])
        }
        ctx.stroke()
      }
    })
  }

   return {
    cleanup: () => {
      console.log("🧹 Cleaning up drawpage")
      socket.removeEventListener('message', handleMessage)
      
      if ((canvas as any)._listeners) {
        (canvas as any)._listeners.forEach((listenerInfo: any) => {
          canvas.removeEventListener(listenerInfo.type, listenerInfo.handler)
        })
        ;(canvas as any)._listeners = []
      }
    },
    setTool: setTool
  }
}

// ✅ RENAMED FUNCTION TO REFLECT THAT IT GETS MESSAGES
async function getMessagesFromServer(roomId: number): Promise<Message[]> {
  try {
    console.log("🌐 Fetching messages from server for room:", roomId)
    const response = await axios.get(`${Http_Backend}/chats/${roomId}`)
    console.log("✅ Server response:", response.data.length, "messages")
    return response.data
  } catch (error) {
    console.error("❌ Error fetching messages from server:", error)
    return []
  }
}
async function deleteFromServer(messageId:number){
try{
  console.log("this is from delete from server ",messageId)
  const deleted = await axios.delete(`${Http_Backend}/chats/${messageId}`) 
  if(deleted){
    console.log("deleted sucessfully")
  }
}
 catch(error) {
    console.error("Error deleting message from server:", error)
    if (axios.isAxiosError(error)) {
      console.error("- Status:", error.response?.status)
      console.error("- Message:", error.message)
    }
    return false
  }
}

function isInsideMessage(x: number, y: number, message: Message): boolean {
  if (message.type === "RECT" && message.width && message.height) {
    return (
      x >= message.startX &&
      x <= message.startX + message.width &&
      y >= message.startY &&
      y <= message.startY + message.height
    )
  } else if (message.type === "CIRCLE" && message.radius) {
    const dx = x - message.startX
    const dy = y - message.startY
    return Math.sqrt(dx * dx + dy * dy) <= message.radius
  } else if (message.type === "FREEHAND" && message.points) {
    return message.points.some(([px, py]) => {
      return Math.hypot(px - x, py - y) < 10 // 10px tolerance
    })
  }
  return false
}