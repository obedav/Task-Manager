import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') ?? 'http://localhost:5001';

export function useSocket(isAuthenticated) {
  const qc = useQueryClient();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = io(SOCKET_URL, {
      withCredentials: true, // sends httpOnly cookies for auth
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    const invalidateTasks = () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    };

    socket.on('task:created', invalidateTasks);
    socket.on('task:updated', invalidateTasks);
    socket.on('task:deleted', invalidateTasks);

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, qc]);

  return socketRef.current;
}
