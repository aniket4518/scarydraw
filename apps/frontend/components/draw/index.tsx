 

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


  let existingshape :shape[] =   []

export default function drawPage(canvasRef: React.RefObject<HTMLCanvasElement>) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

    
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
          existingshape.push({
            type :"rect",
            x:startX,
            y:startY,
            width ,
            height 
      })
      });

      canvas.addEventListener("mousemove", (e) => {
        if (isDrawing) {
          const pos = getMousePos(e);
          const width = pos.x - startX;
          const height = pos.y - startY;

           clearcanvas(ctx,canvas)
           renderexistingshapes(ctx)
           ctx.strokeRect(startX, startY, width, height); 
           
       
          
        }
        function renderexistingshapes(ctx:CanvasRenderingContext2D){ 
              existingshape.map((shape)=>{
                 if(shape.type=="rect"){
                  ctx.strokeRect( shape.x,  shape.y, shape.width, shape.height)
                 }
              })
        }
        function clearcanvas(ctx:CanvasRenderingContext2D,canvas:HTMLCanvasElement){
           ctx.clearRect(0, 0, canvas.width, canvas.height); 
               
        }

      });
    }