import { Socket } from "dgram";
 
import SocketCanvas from "@/components/SocketCanvas";

export default async function CanvasPage({ params }: { params: { roomid: string } }) {
  const roomId =   Number((await params).roomid);
  console.log("from page.tsx",roomId)
  if (Number.isNaN(roomId)) return <div>Invalid room id</div>;
     


  return   <SocketCanvas roomId={roomId} />;
}