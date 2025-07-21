import { TaskPriority } from '@/entities/task/model/types';

export type { Task, CreateTaskDto } from '@/entities/task/model/types';
export { TaskPriority } from '@/entities/task/model/types';

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

export interface CreateTaskFormData {
  title: string;
  description?: string;
  priority: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
} 