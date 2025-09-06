import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Re-sign the token payload into a JWT string
 const signedToken = jwt.sign(token, process.env.NEXTAUTH_SECRET!); 

  return NextResponse.json({ token: signedToken });
}
