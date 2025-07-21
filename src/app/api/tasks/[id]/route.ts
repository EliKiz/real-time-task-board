import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/shared/config/auth.config';
import { prisma } from '@/shared/lib/prisma';

// GET /api/tasks/[id] - получение одной задачи
export const GET = async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
        OR: [
          { createdById: session.user.id },
          { assigneeId: session.user.id },
        ],
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
};

// PUT/PATCH /api/tasks/[id] - обновление задачи
export const PUT = async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Проверяем права доступа
    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
        OR: [
          { createdById: session.user.id },
          { assigneeId: session.user.id },
        ],
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found or access denied' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description, status, priority, assigneeId, dueDate } = body;

    // Проверяем assignee если передан
    if (assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: assigneeId },
      });
      
      if (!assignee) {
        return NextResponse.json(
          { error: 'Assignee not found' },
          { status: 400 }
        );
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
};

// DELETE /api/tasks/[id] - удаление задачи
export const DELETE = async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Только создатель или админ может удалить задачу
    if (task.createdById !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only task creator or admin can delete this task' },
        { status: 403 }
      );
    }

    await prisma.task.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}; 