import { Http_Backend } from "../../config"
import axios from 'axios'

type shape = {
    type: "RECT",
    startX: number,
    startY: number,
    width: number,
    height: number,
} | {
    type: "CIRCLE",
    startX: number,
    startY: number,
    radius: number,
}

export default async function drawpage(canvas: HTMLCanvasElement, roomId: number, socket: WebSocket) {
  console.log("🎨 Draw function called for room:", roomId)
  
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    console.log("❌ Failed to get canvas context")
    return () => {} // Return empty cleanup function
  }
  
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
 
  const existingshape: shape[] = []
  
  // Load existing messages from server
  const existingMessages = await getshapefromserver(roomId)
  console.log("📥 Loaded existing messages:", existingMessages)
  
  if (existingMessages && Array.isArray(existingMessages)) {
    existingMessages.forEach((msg: any) => {
      // ✅ FIXED: Handle shape types properly
      if (msg.type === "RECT") {
        existingshape.push({
          type: "RECT",
          startX: msg.startX,
          startY: msg.startY,
          width: msg.width,
          height: msg.height
        })
      } else if (msg.type === "CIRCLE") {
        existingshape.push({
          type: "CIRCLE",
          startX: msg.startX,
          startY: msg.startY,
          radius: msg.radius
        })
      }
    })
  }

  // ✅ FIXED: Better WebSocket message handling
  const handleMessage = (event: MessageEvent) => {
    console.log("🔥 WebSocket message received:", event.data)
    try {
      const message = JSON.parse(event.data)
      if (message.type === "chat" && message.message) {
        console.log("🔥 Processing new shape:", message.message)
        existingshape.push(message.message)
        clearcanvas(canvas, ctx, existingshape)
        console.log("✅ Canvas updated with new shape")
      }
    } catch (error) {
      console.error("❌ Error parsing WebSocket message:", error)
    }
  }

  // Remove any existing listener and add new one
  socket.removeEventListener('message', handleMessage)
  socket.addEventListener('message', handleMessage)
   
  clearcanvas(canvas, ctx, existingshape)
  console.log("🎨 Canvas setup complete, adding mouse listeners")
  
  let clicked = false
  let startx = 0
  let starty = 0

  // ✅ FIXED: Event handlers as named functions for proper cleanup
  const handleMouseDown = (e: MouseEvent) => {
    clicked = true
    console.log("🖱️ Mouse down")
    const rect = canvas.getBoundingClientRect() // ✅ Fresh rect calculation
    startx = e.clientX - rect.left
    starty = e.clientY - rect.top
  }

  const handleMouseUp = (e: MouseEvent) => {
    if (!clicked) return
    clicked = false
    
    const rect = canvas.getBoundingClientRect() // ✅ Fresh rect calculation
    const width = (e.clientX - rect.left) - startx
    const height = (e.clientY - rect.top) - starty
    
    const shape: shape = {
      type: "RECT",
      startX: startx,
      startY: starty,
      width,
      height
    }
    
    console.log("🎨 Drawing completed, sending shape:", shape)
    existingshape.push(shape)
    clearcanvas(canvas, ctx, existingshape)
    
    // Send to WebSocket
    socket.send(JSON.stringify({
      type: "chat",
      message: shape,
      roomId
    }))
    console.log("📤 Shape sent via WebSocket")
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (clicked) {
      const rect = canvas.getBoundingClientRect() // ✅ Fresh rect calculation
      const width = (e.clientX - rect.left) - startx
      const height = (e.clientY - rect.top) - starty
      clearcanvas(canvas, ctx, existingshape)
      ctx.strokeRect(startx, starty, width, height)
    }
  }

  // ✅ FIXED: Remove existing listeners before adding new ones
  canvas.removeEventListener("mousedown", handleMouseDown)
  canvas.removeEventListener("mouseup", handleMouseUp)
  canvas.removeEventListener("mousemove", handleMouseMove)

  // Add event listeners
  canvas.addEventListener("mousedown", handleMouseDown)
  canvas.addEventListener("mouseup", handleMouseUp)
  canvas.addEventListener("mousemove", handleMouseMove)

  function clearcanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, existingshape: shape[]) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    existingshape.forEach((shape, index) => {
      console.log(`🎨 Drawing shape ${index}:`, shape)
      if (shape.type === "RECT") {
        ctx.strokeRect(shape.startX, shape.startY, shape.width, shape.height)
      } else if (shape.type === "CIRCLE") {
        ctx.beginPath()
        ctx.arc(shape.startX, shape.startY, shape.radius, 0, Math.PI * 2)
        ctx.stroke()
      }
    })
  }

  // ✅ FIXED: Return cleanup function
  return () => {
    console.log("🧹 Cleaning up drawpage listeners")
    socket.removeEventListener('message', handleMessage)
    canvas.removeEventListener("mousedown", handleMouseDown)
    canvas.removeEventListener("mouseup", handleMouseUp)
    canvas.removeEventListener("mousemove", handleMouseMove)
  }
}

async function getshapefromserver(roomId: number) {
  try {
    console.log("📡 Fetching shapes for room:", roomId)
    const response = await axios.get(`${Http_Backend}/chats/${roomId}`)
    console.log("📥 Server response:", response.data)
    return response.data
  } catch (error) {
    console.error("❌ Error fetching shapes:", error)
    return []
  }
}