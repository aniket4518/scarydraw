import SocketCanvas from "../../../components/SocketCanvas";

export default async function CanvasPage({ params }: { params: { roomid: string } }) {
  const roomId =   Number((await params).roomid);
  if (Number.isNaN(roomId)) return <div>Invalid room id</div>;
  return <SocketCanvas roomId={roomId} />;
}