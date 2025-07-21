import { io, Socket } from 'socket.io-client';
import { PropertyStatus } from '../types/Property';

interface PropertyUpdateData {
  propertyId: string;
  columnIndex: number;
  position: number;
  status: PropertyStatus;
  comment?: string;
}

interface PropertySocketResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

class WebSocketClient {
  private socket: Socket | null = null;
  private isConnected = false;
  private listeners: Map<string, Function[]> = new Map();
  private authToken: string | null = null;

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    console.log('Initializing socket');
    this.authToken = localStorage.getItem('yad2_token');

    this.socket = io('http://192.168.1.217:4000', {
      auth: {
        token: this.authToken,
      },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.isConnected = true;
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      this.isConnected = false;
      this.emit('disconnected');
    });

    this.socket.on(
      'propertyInteractionUpdated',
      (data: PropertySocketResponse) => {
        this.emit('propertyInteractionUpdated', data);
      }
    );

    this.socket.on(
      'propertyInteractionCreated',
      (data: PropertySocketResponse) => {
        this.emit('propertyInteractionCreated', data);
      }
    );

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);

      this.emit('connectionError', error);
    });
  }

  async getProperties(): Promise<PropertySocketResponse> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit(
        'getPropertyInteractions',
        (response: PropertySocketResponse) => {
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error(response.message || response.error));
          }
        }
      );
    });
  }

  async updateProperty(
    data: PropertyUpdateData
  ): Promise<PropertySocketResponse> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit(
        'updatePropertyInteraction',
        data,
        (response: PropertySocketResponse) => {
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error(response.message || response.error));
          }
        }
      );
    });
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data));
    }
  }

  connect() {
    if (this.socket && !this.isConnected) {
      this.socket.connect();
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  setAuthToken(token: string) {
    this.authToken = token;
    localStorage.setItem('yad2_token', token);

    if (this.socket) {
      this.socket.disconnect();
      this.initializeSocket();
    }
  }
}

export const websocketClient = new WebSocketClient();
export default websocketClient;
