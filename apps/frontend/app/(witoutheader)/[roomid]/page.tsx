import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import SocketCanvas from "@/components/SocketCanvas";
import { authOptions } from "@/lib/auth";

type Props = {
  params: Promise<{ roomid: string }>;
};

export default async function CanvasPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/signin");
  }

  const resolvedParams = await params;
  const roomId = Number(resolvedParams.roomid);
  console.log("from page.tsx", roomId);

  if (Number.isNaN(roomId)) return <div>Invalid room id</div>;

  return <SocketCanvas roomId={roomId} />;
}