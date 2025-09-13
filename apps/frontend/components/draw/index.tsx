import { Shapes } from "lucide-react"
import { Http_Backend } from "../../config"
import axios from 'axios'
import { startTransition } from "react"

export enum tools {
  RECT,
  CIRCLE,
  FREEHAND,
  ERASER
}

// console.log("🛠️ Tools enum values:", {
//   RECT: tools.RECT,
//   CIRCLE: tools.CIRCLE,
//   FREEHAND: tools.FREEHAND
// })

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
}|{
    type: "FREEHAND",
    startX: number,
    startY: number,
    points: [number, number][]
}|{
  type:"ERASER", 
}

export default async function drawpage(canvas: HTMLCanvasElement, roomId: number, socket: WebSocket,tool:tools) {
  
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
 
  const existingshape: shape[] = []
  
 
  const existingMessages = await getshapefromserver(roomId)
  
  
  if (existingMessages && Array.isArray(existingMessages)) {
    existingMessages.forEach((msg: any) => {
     
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
      else if (msg.type === "FREEHAND") {
        existingshape.push({
          type: "FREEHAND",
          startX: msg.startX,
          startY: msg.startY,
          points: msg.points || []
        })
      }
    })
  }

 
  const handleMessage = (event: MessageEvent) => {
    
    try {
      const message = JSON.parse(event.data)
      if (message.type === "chat" && message.message) {
 
        existingshape.push(message.message)
        clearcanvas(canvas, ctx, existingshape)
        
      }
    } catch (error) {
      console.error(" Error parsing WebSocket message:", error)
    }
  }

 
  socket.removeEventListener('message', handleMessage)
  socket.addEventListener('message', handleMessage)
   
  clearcanvas(canvas, ctx, existingshape)
 
  
  let clicked = false
  let startx = 0
  let starty = 0
  let pencilPoints: [number, number][] = []  
  
  const handleMouseDown = (e: MouseEvent) => {
    clicked = true
  
    const rect = canvas.getBoundingClientRect()  
    startx = e.clientX - rect.left
    starty = e.clientY - rect.top
     
    if (tool === tools.FREEHAND) {
      pencilPoints = [[startx, starty]]
   
    } else if (tool === tools.ERASER) {
    // Simple hit-test (can be improved) — iterate backwards when splicing
    for (let i = existingshape.length - 1; i >= 0; i--) {
      if (isInsideShape(startx, starty, existingshape[i])) {
        existingshape.splice(i, 1) // remove the shape
      }
    }
    clearcanvas(canvas, ctx, existingshape)
  } else {
      pencilPoints = []  
    }
 }

  const handleMouseUp = (e: MouseEvent) => {
    if (!clicked) return
    clicked = false

    

    const rect = canvas.getBoundingClientRect()  
    const endx= (e.clientX - rect.left)
    const endy= (e.clientY - rect.top)
    
    let shape: shape | null = null

    if (tool === tools.RECT) {
     
    
      const minX = Math.min(startx, endx)
      const minY = Math.min(starty, endy)
      const maxX = Math.max(startx, endx)
      const maxY = Math.max(starty, endy)
      
      shape = {
        type: "RECT",
        startX: minX,
        startY: minY,
        width: maxX - minX,
        height: maxY - minY
      }
    }
    else if (tool === tools.CIRCLE) {
    
      const radius = Math.sqrt(Math.pow(endx- startx, 2) + Math.pow(endy - starty, 2))
      shape = {
        type: "CIRCLE",
        startX: startx,
        startY: starty,
        radius
      }
    }
    else if (tool === tools.FREEHAND) {
    
      if (pencilPoints.length === 0 || 
          pencilPoints[pencilPoints.length - 1][0] !== endx || 
          pencilPoints[pencilPoints.length - 1][1] !== endy) {
        pencilPoints.push([endx, endy])
      }
      
      shape = {
        type: "FREEHAND",
        startX: startx,
        startY: starty,
        points: [...pencilPoints] 
      }
    } else {
      console.log("Unknown tool:", tool)
      return  
    }

    if (shape) {
      existingshape.push(shape)
      clearcanvas(canvas, ctx, existingshape)
     
      socket.send(JSON.stringify({
        type: "chat",
        message: shape,
        roomId
      }))
    }
 
    if (tool === tools.FREEHAND) {
      pencilPoints = []
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (clicked) {
      const rect = canvas.getBoundingClientRect()  
      const  currentx = (e.clientX - rect.left)  
      const currenty= (e.clientY - rect.top)  
      clearcanvas(canvas, ctx, existingshape)

      console.log("Mouse move with tool:", tool, "Tool name:", tools[tool])

      if (tool === tools.RECT) {
        console.log("Drawing RECT preview")
    
        const minX = Math.min(startx, currentx)
        const minY = Math.min(starty, currenty)
        const maxX = Math.max(startx, currentx)
        const maxY = Math.max(starty, currenty)
        
        ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
      } else if (tool === tools.CIRCLE) {
        console.log("Drawing CIRCLE preview")
        const radius = Math.sqrt(Math.pow(currentx - startx, 2) + Math.pow(currenty - starty, 2));
        ctx.beginPath();
        ctx.arc(startx, starty, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (tool === tools.FREEHAND) {
        console.log(" Drawing FREEHAND preview")
        pencilPoints.push([currentx, currenty]);
        if (pencilPoints.length > 1) {
          ctx.beginPath();
          ctx.moveTo(pencilPoints[0][0], pencilPoints[0][1]);
          for (let i = 1; i < pencilPoints.length; i++) {
            ctx.lineTo(pencilPoints[i][0], pencilPoints[i][1]);
          }
          ctx.stroke();
        }
      } else {
    
        pencilPoints = []
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

  function clearcanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, existingshape: shape[]) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    existingshape.forEach((shape, index) => {
       
      if (shape.type === "RECT") {
        ctx.strokeRect(shape.startX, shape.startY, shape.width, shape.height)
      } else if (shape.type === "CIRCLE") {
        ctx.beginPath()
        ctx.arc(shape.startX, shape.startY, shape.radius, 0, Math.PI * 2)
        ctx.stroke()
      } else if (shape.type === "FREEHAND" && shape.points.length > 1) {
        ctx.beginPath()
        ctx.moveTo(shape.points[0][0], shape.points[0][1])
        for (let i = 1; i < shape.points.length; i++) {
          ctx.lineTo(shape.points[i][0], shape.points[i][1])
        }
        ctx.stroke()
      }
    })
  }

  
  return () => {
 
    socket.removeEventListener('message', handleMessage)
    
    // Use the new tracking system for cleanup
    if ((canvas as any)._listeners) {
      (canvas as any)._listeners.forEach((listenerInfo: any) => {
        canvas.removeEventListener(listenerInfo.type, listenerInfo.handler)
      })
      ;(canvas as any)._listeners = []
    }
    
  }
}

async function getshapefromserver(roomId: number) {
  try {
     
    const response = await axios.get(`${Http_Backend}/chats/${roomId}`)
    
    return response.data
  } catch (error) {
    
    return []
  }
}
function isInsideShape(x: number, y: number, shape: shape): boolean {
  if (shape.type === "RECT") {
    return (
      x >= shape.startX &&
      x <= shape.startX + shape.width &&
      y >= shape.startY &&
      y <= shape.startY + shape.height
    )
  } else if (shape.type === "CIRCLE") {
    const dx = x - shape.startX
    const dy = y - shape.startY
    return Math.sqrt(dx * dx + dy * dy) <= shape.radius
  } else if (shape.type === "FREEHAND") {
    return shape.points.some(([px, py]) => {
      return Math.hypot(px - x, py - y) < 10 // 10px tolerance
    })
  }
  return false
}