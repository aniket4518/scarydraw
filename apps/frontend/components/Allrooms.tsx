"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface Room {
  id: number;
  name: string;
  adminId: string;
  createdAt?: string;
}

export default function Allrooms() {
  const { data: session, status } = useSession();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (status === 'authenticated') {
      fetchRooms();
    }
  }, [status]);

  const fetchRooms = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/rooms', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch rooms');
      }

      const roomsData = await res.json();
      console.log('Fetched rooms:', roomsData);
      
      if (Array.isArray(roomsData)) {
        setRooms(roomsData);
      } else {
        setRooms([]);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="p-4 text-center text-gray-600">
        Please sign in to view your rooms
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Your Rooms</h2>
        <button
          onClick={fetchRooms}
          disabled={loading}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          <p>No rooms found</p>
          <p className="text-sm">Create your first room to get started!</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => window.location.href = `/canvas/${room.id}`}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">{room.name}</h3>
                <span className="text-sm text-gray-500">ID: {room.id}</span>
              </div>
              {room.createdAt && (
                <p className="text-xs text-gray-400 mt-1">
                  Created: {new Date(room.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
    