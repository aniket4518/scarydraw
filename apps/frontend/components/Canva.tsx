"use client"
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import drawpage, { tools } from "./draw";
import { Circle, EraserIcon, Icon, PencilIcon, RectangleHorizontal, RectangleVerticalIcon, X } from "lucide-react";
import IconButton from "./Icon";

export default function Canva({ roomId, socket }: {
  roomId: number
  socket: WebSocket
}) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, settool] = useState<tools>(tools.ERASER)
  const drawpageRef = useRef<{ setTool: (newTool: tools) => void } | null>(null);
  useEffect(() => {
    let cleanup: (() => void) | undefined;



    if (canvasRef.current && socket && socket.readyState === WebSocket.OPEN) {
      const canvas = canvasRef.current;

      const cleanupPromise = drawpage(canvas, roomId, socket, tool);
      cleanupPromise.then((result: any) => {
        // drawpage may resolve to a function or an object with cleanup/setTool
        if (typeof result === 'function') {
          cleanup = result;
        } else if (result && typeof result.cleanup === 'function') {
          cleanup = result.cleanup;
          drawpageRef.current = result;
        } else {
          // unexpected shape, try to attach setTool if present
          if (result && typeof result.setTool === 'function') {
            drawpageRef.current = result;
          } else {
            console.warn("Unexpected drawpage result:", result);
          }
        }
      }).catch((error) => {
        console.error("Error setting up drawpage:", error);
      });
    }

    // Cleanup function
    return () => {

      if (cleanup) {
        cleanup();

      }
      drawpageRef.current = null;
    };
  }, [socket, roomId]);

  const handleToolChange = (newTool: tools) => {
    console.log("Changing tool to:", tools[newTool]);
    settool(newTool);

    // UPDATE TOOL INSIDE EXISTING DRAWPAGE INSTANCE
    if (drawpageRef.current && drawpageRef.current.setTool) {
      drawpageRef.current.setTool(newTool);
    } else {
      console.warn("drawpage not available")
    }
  };

  return (
    <>
      <canvas ref={canvasRef} className="w-full h-full border border-gray-200 absolute" />

      <div className="absolute top-5 left-1/2 -translate-x-1/2 inline-flex items-center bg-slate-100 border-double border shadow-lg rounded-full hover:shadow-lg hover:shadow-sky-500/50 z-[100]" >
        <IconButton
          icon={<PencilIcon size={34} />}
          onClick={() => {
            handleToolChange(tools.FREEHAND)
          }}
          tool={tool}
          currentTool={tool}        // PASS CURRENT TOOL
          toolType={tools.FREEHAND}
        />
        <IconButton
          icon={<Circle size={34} />}
          onClick={() => {
            handleToolChange(tools.CIRCLE)
          }}
          tool={tool}
          currentTool={tool}
          toolType={tools.CIRCLE}
        />
        <IconButton
          icon={<RectangleVerticalIcon size={34} />}
          onClick={() => {
            handleToolChange(tools.RECT)
          }}
          tool={tool}
          currentTool={tool}
          toolType={tools.RECT}
        />
        <IconButton
          icon={<EraserIcon size={34} />}
          onClick={() => {
            handleToolChange(tools.ERASER)
          }}
          tool={tool}
          currentTool={tool}        // PASS CURRENT TOOL
          toolType={tools.ERASER}
        />
      </div>

      {/* Close Button extracted visually to top-right to prevent clipping and layout overflow */}
      <div className="absolute top-5 right-5 z-[100]">
        <button
          onClick={() => router.push("/room")}
          className="flex items-center gap-x-2 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-red-700 hover:shadow-sky-500/50 transition-all font-semibold"
          title="Close Canvas"
        >
          <X size={24} strokeWidth={2.5} />
          <span>Close</span>
        </button>
      </div>


    </>
  )
}