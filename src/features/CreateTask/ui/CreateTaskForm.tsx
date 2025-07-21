"use client";

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LoadingSpinner } from '@/shared/ui/loading';
import { TaskPriority } from '@/entities/task/model/types';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface CreateTaskData {
  title: string;
  description?: string;
  priority: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
}

const api = {
  async createTask(data: CreateTaskData) {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create task');
    }
    
    return response.json();
  },

  async getUsers() {
    const response = await fetch('/api/users');
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    const data = await response.json();
    return data.users;
  },
};

const priorityLabels = {
  [TaskPriority.LOW]: { label: 'Low', icon: '○', color: 'emerald' },
  [TaskPriority.MEDIUM]: { label: 'Medium', icon: '◐', color: 'amber' },
  [TaskPriority.HIGH]: { label: 'High', icon: '●', color: 'orange' },
  [TaskPriority.CRITICAL]: { label: 'Critical', icon: '⚡', color: 'red' },
};

export const CreateTaskForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const queryClient = useQueryClient();

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: api.getUsers,
  });

  const createTaskMutation = useMutation({
    mutationFn: api.createTask,
    onSuccess: () => {
      setTitle('');
      setDescription('');
      setPriority(TaskPriority.MEDIUM);
      setAssigneeId('');
      setDueDate('');
      setIsSuccess(true);
      
      setTimeout(() => setIsSuccess(false), 3000);
      
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: Error) => {
      console.error('Error creating task:', error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    const taskData: CreateTaskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      assigneeId: assigneeId || undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    };

    createTaskMutation.mutate(taskData);
  };

  return (
    <div className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-xl border border-border/20 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border/30 bg-gradient-to-r from-muted/50 to-card/50">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"></div>
          <h2 className="text-xl font-semibold text-foreground tracking-tight">
            Create New Task
          </h2>
        </div>
      </div>
      
      {/* Form */}
      <div className="flex-1 p-6 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={createTaskMutation.isPending}
              className="w-full px-4 py-3 border-2 border-border/50 rounded-xl shadow-sm placeholder-muted-foreground text-foreground bg-background/90 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-ring/20 focus:border-ring disabled:opacity-50 transition-all duration-200 font-medium"
              placeholder="Enter a clear, actionable task title..."
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={createTaskMutation.isPending}
              className="w-full px-4 py-3 border-2 border-border/50 rounded-xl shadow-sm placeholder-muted-foreground text-foreground bg-background/90 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-ring/20 focus:border-ring disabled:opacity-50 transition-all duration-200 resize-none font-medium leading-relaxed"
              placeholder="Provide additional context and requirements..."
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label htmlFor="priority" className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Priority
            </label>
            <div className="relative">
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                disabled={createTaskMutation.isPending}
                className="w-full px-4 py-3 border-2 border-border/50 rounded-xl shadow-sm text-foreground bg-background/90 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-ring/20 focus:border-ring disabled:opacity-50 transition-all duration-200 font-medium appearance-none cursor-pointer"
              >
                {Object.entries(priorityLabels).map(([value, { label, icon }]) => (
                  <option key={value} value={value}>
                    {icon} {label}
                  </option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <label htmlFor="assignee" className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Assignee
            </label>
            {usersLoading ? (
              <div className="flex items-center justify-center py-8 px-4 border-2 border-border/50 rounded-xl bg-background/90 backdrop-blur-sm">
                <LoadingSpinner size="sm" className="mr-3" />
                <span className="text-sm text-muted-foreground font-medium">Loading team members...</span>
              </div>
            ) : (
              <div className="relative">
                <select
                  id="assignee"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  disabled={createTaskMutation.isPending}
                  className="w-full px-4 py-3 border-2 border-border/50 rounded-xl shadow-sm text-foreground bg-background/90 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-ring/20 focus:border-ring disabled:opacity-50 transition-all duration-200 font-medium appearance-none cursor-pointer"
                >
                  <option value="">Select team member...</option>
                  {users?.map((user: User) => (
                    <option key={user.id} value={user.id}>
                      👤 {user.name || user.email} • {user.role}
                    </option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label htmlFor="dueDate" className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={createTaskMutation.isPending}
              className="w-full px-4 py-3 border-2 border-border/50 rounded-xl shadow-sm text-foreground bg-background/90 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-ring/20 focus:border-ring disabled:opacity-50 transition-all duration-200 font-medium"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={createTaskMutation.isPending || !title.trim()}
              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold py-4 px-6 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:hover:translate-y-0"
            >
              {createTaskMutation.isPending ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
                  <span>Creating Task...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create Task</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Message */}
      {isSuccess && (
        <div className="absolute inset-x-4 top-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-2xl shadow-lg backdrop-blur-xl border border-white/20 transform transition-all duration-300 animate-pulse">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold">Task created successfully!</p>
              <p className="text-sm opacity-90">Your new task has been added to the board.</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {createTaskMutation.isError && (
        <div className="absolute inset-x-4 top-4 bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground p-4 rounded-2xl shadow-lg backdrop-blur-xl border border-destructive/20 transform transition-all duration-300">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold">Failed to create task</p>
              <p className="text-sm opacity-90">{createTaskMutation.error?.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 