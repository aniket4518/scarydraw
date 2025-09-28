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

export default async function drawpage(canvas: HTMLCanvasElement, roomId: number, socket: WebSocket, initialTool: tools) {
  
  let currentTool = initialTool  
  
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
    return { cleanup: () => {}, setTool: () => {} }  
  }
  
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
 
  const messages: Message[] = []
   
  
  console.log("📥 Loading existing messages from server...")
  
  const existingMessagesFromServer = await getMessagesFromServer(roomId)

  if (existingMessagesFromServer && Array.isArray(existingMessagesFromServer)) {
    existingMessagesFromServer.forEach((msg: Message) => {
      console.log("📦 Loading message from server:", msg.type, "ID:", msg.id)
      messages.push(msg)
    })
  }

  const setTool = (newTool: tools) => {
    console.log("🔧 Tool changed from", tools[currentTool], "to", tools[newTool]);
    currentTool = newTool;
  };

  const handleMessage = (event: MessageEvent) => {
    try {
      const socketMessage = JSON.parse(event.data)
      if (socketMessage.type === "chat" && socketMessage.message) {
        console.log("🔥 Received new message via WebSocket:", socketMessage.message.type)
        
        messages.push(socketMessage.message)
        clearCanvas(canvas, ctx, messages)
        
        console.log("✅ Total messages now:", messages.length)
      }
    } catch (error) {
      console.error("❌ Error parsing WebSocket message:", error)
    }
  }

  socket.removeEventListener('message', handleMessage)
  socket.addEventListener('message', handleMessage)
   
  clearCanvas(canvas, ctx, messages)
  console.log("🎨 Canvas rendered with", messages.length, "messages")
  
  let clicked = false
  let startx = 0
  let starty = 0
  let pencilPoints: [number, number][] = []  
  
  // ✅ SIMPLIFIED: No queue needed - direct delete with Redis backend
  const handleMouseDown = async (e: MouseEvent) => {
    clicked = true
    const rect = canvas.getBoundingClientRect()  
    startx = e.clientX - rect.left
    starty = e.clientY - rect.top
     
    if (currentTool === tools.FREEHAND) {
      pencilPoints = [[startx, starty]]
    } else if (currentTool === tools.ERASER) {
      console.log("🗑️ Eraser tool - deleting messages...")
      
      let deletedCount = 0
      
      // ✅ SIMPLE: Delete messages directly - Redis handles everything
      for (let i = messages.length - 1; i >= 0; i--) {
        if (isInsideMessage(startx, starty, messages[i])) {
          console.log("🎯 Found message to delete:", messages[i].type, "ID:", messages[i].id)
          
          const messageToDelete = messages[i]
          messages.splice(i, 1) // ✅ Remove from UI immediately
          deletedCount++
          
          // ✅ FIRE AND FORGET: Redis queue handles the actual deletion
          if (messageToDelete.id) {
            deleteFromServer(messageToDelete.id).catch(error => {
              console.error("❌ Error queuing delete:", error)
              // Could add message back to UI here if needed
            })
          }
        }
      }
      
      if (deletedCount > 0) {
        console.log("🗑️ Deleted", deletedCount, "messages from UI")
        clearCanvas(canvas, ctx, messages) // ✅ Update UI immediately
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

    if (currentTool === tools.RECT) {
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
      
      messages.push(newMessage)
      clearCanvas(canvas, ctx, messages)
      
      console.log("✅ Total messages now:", messages.length)
      
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

  function clearCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, allMessages: Message[]) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    allMessages.forEach((message) => {
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

// ✅ SIMPLIFIED: Just queue the delete request - Redis handles everything
async function deleteFromServer(messageId: number): Promise<boolean> {
  try {
    console.log("🗑️ [Frontend] Queuing delete for message:", messageId)
    
    const response = await axios.delete(`${Http_Backend}/chats/${messageId}`, {
      timeout: 2000 // Quick timeout since we're just queuing
    })
    
    if (response.status === 200) {
      console.log("✅ [Frontend] Delete queued successfully:", response.data)
      return true
    }
    
    return false
    
  } catch (error) {
    console.error("❌ [Frontend] Delete queue error:", error)
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      
      if (status === 404) {
        console.log("📝 Message not found (already deleted)")
        return true // Consider successful if already deleted
      }
      
      if (status === 409) {
        console.log("⏳ Delete already queued, ignoring...")
        return true // Consider successful if already queued
      }
      
      console.error("- Status:", status)
      console.error("- Data:", error.response?.data)
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