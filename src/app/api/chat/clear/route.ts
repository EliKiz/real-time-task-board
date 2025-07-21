import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/shared/config/auth.config';
import { prisma } from '@/shared/lib/prisma';

export const DELETE = async (request: NextRequest) => {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const result = await prisma.chatMessage.deleteMany({});

    return NextResponse.json({ 
      deletedCount: result.count,
      message: 'Chat cleared successfully' 
    });
  } catch (error) {
    console.error('Error clearing chat:', error);
    return NextResponse.json(
      { error: 'Failed to clear chat' },
      { status: 500 }
    );
  }
};

export const GET = async (request: NextRequest) => {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messageCount = await prisma.chatMessage.count();

    return NextResponse.json({ messageCount });
  } catch (error) {
    console.error('Error getting chat count:', error);
    return NextResponse.json(
      { error: 'Failed to get chat count' },
      { status: 500 }
    );
  }
}; 