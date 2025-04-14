"use client";
import React, { createContext, useState, useContext, useEffect } from 'react';
import { io } from 'socket.io-client';

const ParticipantsContext = createContext();

export const ParticipantsProvider = ({ children }) => {
  const [participants, setParticipants] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Check if we're running in the browser
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize Socket.io connection
  useEffect(() => {
    if (!roomId || !isClient) return;

    try {
      const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
      
      setSocket(socketInstance);

      return () => {
        if (socketInstance) {
          socketInstance.disconnect();
        }
      };
    } catch (error) {
      console.error("Socket initialization error:", error);
    }
  }, [roomId, isClient]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket || !currentUser || !isClient) return;

    try {
      // Connect to room
      socket.emit('join-room', {
        roomId,
        userId: currentUser.id,
        username: currentUser.name,
        isMuted: !currentUser.micOn,
        isDeafened: !currentUser.speakerOn
      });

      // Listen for new users
      socket.on('user-connected', (userData) => {
        console.log('New user connected:', userData);
      });

      // Update participant list when users join/leave/update status
      socket.on('participants-updated', (updatedParticipants) => {
        setParticipants(updatedParticipants.map(p => ({
          id: p.userId,
          name: p.username,
          micOn: !p.isMuted,
          speakerOn: !p.isDeafened,
          speakingNow: p.isSpeaking
        })));
      });

      // Listen for server connection confirmation
      socket.on('connect', () => {
        console.log('Connected to socket server');
        setIsConnected(true);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Disconnected from socket server');
        setIsConnected(false);
      });

      return () => {
        socket.off('user-connected');
        socket.off('participants-updated');
        socket.off('connect');
        socket.off('disconnect');
      };
    } catch (error) {
      console.error("Socket event setup error:", error);
    }
  }, [socket, currentUser, roomId, isClient]);

  // Join a room with user information
  const joinRoom = async (roomId, userName) => {
    if (!isClient) return false;
    
    try {
      // Generate a unique ID for the user
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create user object
      const user = {
        id: userId,
        name: userName,
        micOn: true,
        speakerOn: true,
        speakingNow: false
      };
      
      setCurrentUser(user);
      setRoomId(roomId);

      // Make API call to join room
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/voice-rooms/${roomId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          username: userName
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to join room');
      }

      const roomData = await response.json();
      
      // Format participants data
      const formattedParticipants = roomData.participants.map(p => ({
        id: p.userId,
        name: p.username,
        micOn: !p.isMuted,
        speakerOn: !p.isDeafened,
        speakingNow: p.isSpeaking
      }));
      
      setParticipants(formattedParticipants);
      return true;
    } catch (error) {
      console.error('Error joining room:', error);
      return false;
    }
  };

  // Update user's mic status
  const toggleMic = () => {
    if (!currentUser || !socket || !isConnected || !isClient) return;
    
    try {
      const updatedUser = { ...currentUser, micOn: !currentUser.micOn };
      setCurrentUser(updatedUser);
      
      // Update status in the backend
      socket.emit('update-status', {
        roomId,
        userId: currentUser.id,
        isMuted: !updatedUser.micOn
      });
    } catch (error) {
      console.error("Error toggling mic:", error);
    }
  };

  // Update user's speaker status
  const toggleSpeaker = () => {
    if (!currentUser || !socket || !isConnected || !isClient) return;
    
    try {
      const updatedUser = { ...currentUser, speakerOn: !currentUser.speakerOn };
      setCurrentUser(updatedUser);
      
      // Update status in the backend
      socket.emit('update-status', {
        roomId,
        userId: currentUser.id,
        isDeafened: !updatedUser.speakerOn
      });
    } catch (error) {
      console.error("Error toggling speaker:", error);
    }
  };

  // Leave the room
  const leaveRoom = async () => {
    if (!currentUser || !roomId || !isClient) return;

    try {
      if (socket && isConnected) {
        socket.emit('leave-room');
      }

      // Make API call to leave room
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/voice-rooms/${roomId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id
        }),
      });

      setCurrentUser(null);
      setRoomId(null);
      setParticipants([]);
      setIsConnected(false);
      
      return true;
    } catch (error) {
      console.error('Error leaving room:', error);
      return false;
    }
  };

  return (
    <ParticipantsContext.Provider
      value={{
        participants,
        currentUser,
        isConnected,
        socket,
        roomId,
        joinRoom,
        leaveRoom,
        toggleMic,
        toggleSpeaker
      }}
    >
      {children}
    </ParticipantsContext.Provider>
  );
};

export const useParticipants = () => useContext(ParticipantsContext);

export default ParticipantsContext; 