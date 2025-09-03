'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Http_Backend } from '../../config';
import Allrooms from '../../components/Allrooms';
export default function CreateRoomPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/signin');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomName.trim()) {
      setError('Room name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Creating room with name:', roomName);
      
      // Call the Next.js API route (which will handle JWT token creation and backend communication)
      const response = await fetch('/api/room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomname: roomName.trim(),
        }),
      });

      console.log('API response status:', response.status);
      const result = await response.json();
      console.log('API response:', result);

      if (!response.ok) {
        setError(result.error || 'Failed to create room');
        return;
      }

      console.log('Room created successfully with ID:', result.id);
      
      // Show success message briefly before redirecting
      setError(''); // Clear any previous errors
      setSuccess(true);
      
      


      
      // Small delay to show success state, then redirect
      setTimeout(() => {
        router.push(`/canvas/${result.id}`);
      }, 500);
      
    } catch (error) {
      console.error('Error creating room:', error);
      setError('Failed to create room. Please try again.');
    } finally {
      // Don't set loading to false if we're redirecting
      if (!success) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-red-200 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Room</h1>
          <p className="text-gray-600">Start a new collaborative drawing session</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            Room created successfully! Redirecting to canvas...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-2">
              Room Name
            </label>
            <input
              type="text"
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors disabled:opacity-50"
              placeholder="Enter room name..."
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {success ? 'Redirecting...' : loading ? 'Creating...' : 'Create Room'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a 
            href="/" 
            className="text-gray-600 hover:text-red-600 transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
       
      <Allrooms/>
    
    </div>

  );
}
