import type { ReactNode } from "react";
import { tools } from "./draw";
//  enum tools {
//   "RECT",
//  "CIRCLE",
//  "FREEHAND",
//   "ERASER"
//  }
export default function IconButton({
  icon,
  onClick,
  tool,
  currentTool,
  toolType
}: {
  icon: ReactNode,
  onClick: () => void
  tool :tools
  toolType:tools
  currentTool:tools
}) {
  const isSelected =currentTool ===toolType
  return (
    <div className={`
        ${isSelected ? 'text-red-700' : 'text-black'}
        transition-colors duration-200 p-2
      `} onClick={onClick}>
      {icon}
    </div>
  );
}