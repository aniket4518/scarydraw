import { Http_Backend } from "../../config"
import axios from 'axios'
type shape ={
    type : "RECT",
    startx:number,
    starty:number,
    width:number,
    height:number ,
  
}|{
    type :"CIRCLE",
    centerx:number,
    centery:number,
    radius:number,
}
 export default async function  drawpage(canvas:HTMLCanvasElement,roomId:number){
  console.log("Draw function called with canvas:", canvas)
  
  const ctx = canvas.getContext('2d')
  if(!ctx){
    console.log("Failed to get canvas context")
    return
  }
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
 
  const existingshape :shape[] =  []
  getshapefromserver(roomId)
   
  console.log("Canvas context obtained, setting up event listeners")
  let clicked = false
  let startx =0
  let starty =0
  const rect = canvas.getBoundingClientRect();
           canvas.addEventListener("mousedown",(e)=>{
            clicked=true
            console.log("Mouse down - clicked set to true")
            startx =e.clientX - rect.left
            starty = e.clientY-rect.top
           
            

           })
           canvas.addEventListener("mouseup",(e)=>{
            clicked=false
              const width = (e.clientX -rect.left) -startx
                const height = (e.clientY-rect.top ) - starty
                existingshape.push({
                    type:"RECT",
                    startx,
                    starty,
                    width,
                    height
                })
                clearcanvas(canvas,ctx,existingshape)
           })
           canvas.addEventListener("mousemove",(e)=>{
             if (clicked){
                // Get canvas-relative coordinates
                const rect = canvas.getBoundingClientRect()
                 
                const width = (e.clientX -rect.left) -startx
                const height = (e.clientY-rect.top ) - starty
                clearcanvas(canvas,ctx,existingshape)
                 
                ctx.strokeRect(startx,starty,width,height)
             
                 
                  
                
             }
                
              
           })

             function clearcanvas(canvas:HTMLCanvasElement,ctx:CanvasRenderingContext2D ,existingshape:shape[]){
                ctx.clearRect(0,0,canvas.width,canvas.height)
                 existingshape.forEach((shape)=>{
                    if(shape.type === "RECT"){
                        ctx.strokeRect(shape.startx,shape.starty,shape.width,shape.height)
                    } else if (shape.type === "CIRCLE"){
                        ctx.beginPath()
                        ctx.arc(shape.centerx, shape.centery, shape.radius, 0, Math.PI * 2)
                        ctx.stroke()
                    }
                 })
           }
            


           }
            async function getshapefromserver(roomId:number) {
               const response = await  axios.get(`${Http_Backend}/chats/${roomId}`)
                const data = response.data;
                console.log(data)
               
               }
           

            
        
 