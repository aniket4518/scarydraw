import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import jwt from 'jsonwebtoken';

// Auth options for getServerSession
const authOptions = {
  providers: [],
  session: {
    strategy: 'jwt' as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }: any) {
      if (token?.id && session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
};

export async function GET(request: NextRequest) {
  try {
    console.log('=== Rooms API Called ===');
    
    // Get the session to check if user is authenticated
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    // Check for both email and the database user ID
    if (!session || !session.user?.email || !(session.user as any)?.id) {
      console.log('No session, email, or user ID found');
      return NextResponse.json(
        { error: 'Unauthorized - No session found' },
        { status: 401 }
      );
    }

    // Get the real database user ID
    const userId = (session.user as any).id;
    console.log('User ID from session:', userId);

    // Create JWT token for backend authentication using NEXTAUTH_SECRET
    const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
    if (!NEXTAUTH_SECRET) {
      console.error('NEXTAUTH_SECRET is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const tokenPayload = {
      userId: userId,  
      email: session.user.email,
      name: session.user.name,
    };

    const token = jwt.sign(tokenPayload, NEXTAUTH_SECRET);
    console.log('Generated JWT token for rooms request',token);

    // Send request to backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    console.log('Sending request to backend:', `${backendUrl}/rooms`);
    
    const response = await fetch(`${backendUrl}/rooms`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token, // Send JWT token in Authorization header
      },
    });

    console.log('Backend response status:', response.status);
    console.log(response)
    
    if (!response.ok) {
      console.error('Backend request failed:', response.status);
      return NextResponse.json(
        { 
          error: 'Backend request failed',
          status: response.status
        },
        { status: response.status }
      );
    }

    const responseText = await response.text();
    console.log('Backend response text:', responseText);

    // Parse the response (should be rooms array)
    let rooms;
    try {
      rooms = JSON.parse(responseText);
    } catch {
      rooms = []; // Return empty array if parsing fails
    }

    console.log('Rooms fetched successfully:', rooms);
    return NextResponse.json(rooms);

  } catch (error) {
    console.error('Error in rooms API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // For POST requests, just redirect to GET (since component is calling POST)
  return GET(request);
}
