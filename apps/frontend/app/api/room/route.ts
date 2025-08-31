import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import jwt from 'jsonwebtoken';

// Simple auth options for getServerSession
const authOptions = {
  providers: [],
  session: {
    strategy: 'jwt' as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function POST(request: NextRequest) {
  try {
    console.log('=== Room Creation API Called ===');
    
    // Get the session to check if user is authenticated
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    if (!session || !session.user?.email) {
      console.log('No session or email found');
      return NextResponse.json(
        { error: 'Unauthorized - No session found' },
        { status: 401 }
      );
    }

    // Get the request body
    const body = await request.json();
    const { roomname } = body;
    console.log('Request body:', body);

    if (!roomname) {
      return NextResponse.json(
        { error: 'Room name is required' },
        { status: 400 }
      );
    }

    // Create JWT token for backend authentication using NEXTAUTH_SECRET
    const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
    if (!NEXTAUTH_SECRET) {
      console.error('NEXTAUTH_SECRET is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create a proper JWT token with user info
    const tokenPayload = {
      userId: session.user.email, // Using email as userId
      email: session.user.email,
      name: session.user.name,
      // Expires in 1 hour
    };

    const token = jwt.sign(tokenPayload, NEXTAUTH_SECRET);
    console.log('Generated JWT token payload:', tokenPayload);
    console.log('JWT token created successfully');

    // Send request to backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    console.log('Sending request to backend:', `${backendUrl}/room`);
    console.log('Request payload:', { roomname });
    
    const response = await fetch(`${backendUrl}/room`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token, // Send JWT token in Authorization header
      },
      body: JSON.stringify({
        roomname: roomname,
      }),
    });

    console.log('Backend response status:', response.status);
    const responseText = await response.text();
    console.log('Backend response text:', responseText);

    if (!response.ok) {
      console.error('Backend request failed:', response.status, responseText);
      return NextResponse.json(
        { 
          error: 'Backend request failed',
          details: responseText,
          status: response.status
        },
        { status: response.status }
      );
    }

    // Parse the response (should be room ID)
    let roomId;
    try {
      roomId = JSON.parse(responseText);
    } catch {
      roomId = responseText; // In case it's just a string/number
    }

    console.log('Room created successfully with ID:', roomId);

    return NextResponse.json({ 
      id: roomId,
      message: 'Room created successfully',
      middlewareWorking: true
    });

  } catch (error) {
    console.error('Error in room creation API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
