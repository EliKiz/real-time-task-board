import { NextResponse } from 'next/server';

// Инициализация WebSocket сервера
export async function GET() {
  try {
    // Импортируем и инициализируем WebSocket сервер
    const { initializeWebSocketServer } = await import('@/lib/websocket-server');
    initializeWebSocketServer();
    
    return NextResponse.json({ 
      message: 'WebSocket server initialized',
      url: 'ws://localhost:3001/chat'
    });
  } catch (error) {
    console.error('Error initializing WebSocket server:', error);
    return NextResponse.json(
      { error: 'Failed to initialize WebSocket server' },
      { status: 500 }
    );
  }
} 