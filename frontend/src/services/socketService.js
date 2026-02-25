import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.joinedRoutes = new Set();
    this.inAllBuses = false;
  }

  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      // Re-join rooms on reconnect
      for (const routeId of this.joinedRoutes) {
        this.socket.emit('joinRoute', routeId);
      }
      if (this.inAllBuses) {
        this.socket.emit('joinAllBuses');
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.joinedRoutes.clear();
      this.inAllBuses = false;
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoute(routeId) {
    if (routeId) {
      this.joinedRoutes.add(routeId);
      if (this.socket?.connected) {
        this.socket.emit('joinRoute', routeId);
      }
    }
  }

  leaveRoute(routeId) {
    if (routeId) {
      this.joinedRoutes.delete(routeId);
      if (this.socket?.connected) {
        this.socket.emit('leaveRoute', routeId);
      }
    }
  }

  joinAllBuses() {
    this.inAllBuses = true;
    if (this.socket?.connected) {
      this.socket.emit('joinAllBuses');
    }
  }

  leaveAllBuses() {
    this.inAllBuses = false;
    if (this.socket?.connected) {
      this.socket.emit('leaveAllBuses');
    }
  }

  onBusLocationUpdate(callback) {
    if (this.socket) {
      this.socket.on('busLocationUpdate', callback);
    }
  }

  offBusLocationUpdate(callback) {
    if (this.socket) {
      this.socket.off('busLocationUpdate', callback);
    }
  }

  onTripStarted(callback) {
    if (this.socket) {
      this.socket.on('tripStarted', callback);
    }
  }

  offTripStarted(callback) {
    if (this.socket) {
      this.socket.off('tripStarted', callback);
    }
  }

  onTripStopped(callback) {
    if (this.socket) {
      this.socket.on('tripStopped', callback);
    }
  }

  offTripStopped(callback) {
    if (this.socket) {
      this.socket.off('tripStopped', callback);
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
