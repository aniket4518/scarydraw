import type { ReactNode } from "react";
 enum tools {
  "RECT",
 "CIRCLE",
 "FREEHAND",
  "ERASER"
 }
export default function IconButton({
  icon,
  onClick,
  tool
}: {
  icon: ReactNode,
  onClick: () => void
  tool:tools
}) {
  return (
    <div className="rounded-full border-black-500 p-2 text-xl" onClick={onClick}>
      {icon}
    </div>
  );
}