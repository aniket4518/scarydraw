import axios from "axios";
import { Http_Backend } from "../../config";
 

type shape ={
type :"rect",
 x:number,
 y:number,
 width:number,
 height:number;
}| {
type :"circle",
 centerx :number,
 centery :number;
 radius:number;
}


  

export default async function drawPage(canvasRef: React.RefObject<HTMLCanvasElement>,roomId :number,socket:WebSocket) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
       let existingshape :shape[] = await  getshapesServer(roomId)
      if (!ctx) return;
      clearcanvas(ctx, canvas);
      renderexistingshapes( ctx,existingshape); 

      //rendering shapes from server
          clearcanvas(ctx, canvas);
      renderexistingshapes(ctx,existingshape);
      
     socket.onmessage=(event) =>{
      const message =JSON.parse(event.data)
      console.log(message)
      if(message.type =="chat"){
        const parsedshape =JSON.parse(message.message)
        existingshape.push(parsedshape)
        clearcanvas(ctx,canvas)
        renderexistingshapes(ctx,existingshape)
      
      }
     }
      
       
    
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;

      let startX = 0;
      let startY = 0;
      let isDrawing = false;

      const getMousePos = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      };

      canvas.addEventListener("mousedown", (e) => {
        const pos = getMousePos(e);
        isDrawing = true;
        startX = pos.x;
        startY = pos.y;
      });

      canvas.addEventListener("mouseup", (e) => {
        isDrawing = false;
           const pos = getMousePos(e);
          const width  = pos.x - startX;
          const height = pos.y - startY;
         const shape :shape = {
            type :"rect",
            x:startX,
            y:startY,
            width ,
            height 
      }
        existingshape.push(shape)
       
        
        socket.send (JSON.stringify({
         type:"chat",
         roomId,
         message :JSON.stringify(
          shape
        )
         
      })
      )
      });

      canvas.addEventListener("mousemove", (e) => {
        if (isDrawing) {
          const pos = getMousePos(e);
          const width = pos.x - startX;
          const height = pos.y - startY;

           clearcanvas(ctx,canvas)
           renderexistingshapes(ctx,existingshape)
           ctx.strokeRect(startX, startY, width, height); 
           
       
          
        }
           });
        function renderexistingshapes(ctx:CanvasRenderingContext2D,existingshape:shape[]){ 
              existingshape.map((shape)=>{
                 if(shape.type=="rect"){
                  ctx.strokeRect( shape.x,  shape.y, shape.width, shape.height)
                 }
              })
        }
        function clearcanvas(ctx:CanvasRenderingContext2D,canvas:HTMLCanvasElement){
           ctx.clearRect(0, 0, canvas.width, canvas.height); 
               
        }
        

     

    }
    
   async function getshapesServer(roomId: number) {
  const {data} = await axios.get(`${Http_Backend}/chats/${roomId}`);
  const messages =  data;
  console.log("message",messages)
  const Bshapes = messages.map((x: { message: string }) => {
   const data =JSON.parse(x.message)
    return data;
  });
  console.log(Bshapes)
  return Bshapes;
   
}