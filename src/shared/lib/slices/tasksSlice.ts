import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TaskPriority, TaskStatus } from '@/entities/task/model/types';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  assignee?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
}

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  statusFilter: TaskStatus | '';
  editingTaskId: string | null;
  editingTitle: string;
  editingDescriptionId: string | null;
  editingDescription: string;
  deleteModalTask: { id: string; title: string } | null;
}

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
  statusFilter: '',
  editingTaskId: null,
  editingTitle: '',
  editingDescriptionId: null,
  editingDescription: '',
  deleteModalTask: null,
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      return data.tasks;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: CreateTaskData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create task');
      }
      
      const data = await response.json();
      return data.task;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, updates }: { id: string; updates: Partial<Task> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update task');
      }
      
      const data = await response.json();
      return data.task;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete task');
      }
      
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setStatusFilter: (state, action: PayloadAction<TaskStatus | ''>) => {
      state.statusFilter = action.payload;
    },
    setEditingTaskId: (state, action: PayloadAction<string | null>) => {
      state.editingTaskId = action.payload;
    },
    setEditingTitle: (state, action: PayloadAction<string>) => {
      state.editingTitle = action.payload;
    },
    setEditingDescriptionId: (state, action: PayloadAction<string | null>) => {
      state.editingDescriptionId = action.payload;
    },
    setEditingDescription: (state, action: PayloadAction<string>) => {
      state.editingDescription = action.payload;
    },
    setDeleteModalTask: (state, action: PayloadAction<{ id: string; title: string } | null>) => {
      state.deleteModalTask = action.payload;
    },
    clearEditingState: (state) => {
      state.editingTaskId = null;
      state.editingTitle = '';
      state.editingDescriptionId = null;
      state.editingDescription = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
      });
  },
});

export const {
  setStatusFilter,
  setEditingTaskId,
  setEditingTitle,
  setEditingDescriptionId,
  setEditingDescription,
  setDeleteModalTask,
  clearEditingState,
} = tasksSlice.actions;

export default tasksSlice.reducer; 