"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ComponentLoading } from "@/shared/ui/loading";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
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

const api = {
  async getTasks(): Promise<Task[]> {
    const response = await fetch("/api/tasks");
    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }
    const data = await response.json();
    return data.tasks;
  },

  async updateTask(id: string, updates: Partial<Task>) {
    const response = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update task");
    }

    return response.json();
  },

  async deleteTask(id: string) {
    const response = await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete task");
    }

    return response.json();
  },
};

const getStatusBadge = (status: string) => {
  const badges = {
    TODO: "bg-gradient-to-r from-muted to-muted/80 text-muted-foreground shadow-sm",
    IN_PROGRESS: "bg-gradient-to-r from-primary/10 to-primary/20 text-primary shadow-sm",
    COMPLETED: "bg-gradient-to-r from-green-100 to-green-200 text-green-800 shadow-sm",
  };

  const labels = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm border border-border/20 ${
        badges[status as keyof typeof badges]
      }`}
    >
      {labels[status as keyof typeof labels]}
    </span>
  );
};

const getPriorityBadge = (priority: string) => {
  const badges = {
    LOW: "bg-gradient-to-r from-green-50 to-emerald-100 text-emerald-700 border-emerald-200",
    MEDIUM: "bg-gradient-to-r from-yellow-50 to-amber-100 text-amber-700 border-amber-200",
    HIGH: "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border-orange-200",
    CRITICAL: "bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200",
  };

  const icons = {
    LOW: "○",
    MEDIUM: "◐", 
    HIGH: "●",
    CRITICAL: "⚡",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-sm shadow-sm ${
        badges[priority as keyof typeof badges]
      }`}
    >
      <span className="text-xs">{icons[priority as keyof typeof icons]}</span>
      {priority.charAt(0) + priority.slice(1).toLowerCase()}
    </span>
  );
};

export const TaskList = () => {
  const [statusFilter, setStatusFilter] = useState<
    "TODO" | "IN_PROGRESS" | "COMPLETED" | ""
  >("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");
  const [editingDescriptionId, setEditingDescriptionId] = useState<
    string | null
  >(null);
  const [editingDescription, setEditingDescription] = useState<string>("");
  const [deleteModalTask, setDeleteModalTask] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const queryClient = useQueryClient();

  const {
    data: tasks = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: api.getTasks,
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
      api.updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: Error) => {
      alert(`Error updating task: ${error.message}`);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: api.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: Error) => {
      alert(`Error deleting task: ${error.message}`);
    },
  });

  const handleStatusChange = (
    taskId: string,
    newStatus: "TODO" | "IN_PROGRESS" | "COMPLETED"
  ) => {
    updateTaskMutation.mutate({
      id: taskId,
      updates: { status: newStatus },
    });
  };

  const handleDeleteTask = (taskId: string, taskTitle: string) => {
    setDeleteModalTask({ id: taskId, title: taskTitle });
  };

  const confirmDeleteTask = () => {
    if (deleteModalTask) {
      deleteTaskMutation.mutate(deleteModalTask.id);
      setDeleteModalTask(null);
    }
  };

  const cancelDeleteTask = () => {
    setDeleteModalTask(null);
  };

  const handleTitleClick = (taskId: string, currentTitle: string) => {
    setEditingTaskId(taskId);
    setEditingTitle(currentTitle);
  };

  const handleTitleSave = (taskId: string) => {
    if (
      editingTitle.trim() &&
      editingTitle !== filteredTasks.find((t) => t.id === taskId)?.title
    ) {
      updateTaskMutation.mutate({
        id: taskId,
        updates: { title: editingTitle.trim() },
      });
    }
    setEditingTaskId(null);
    setEditingTitle("");
  };

  const handleTitleCancel = () => {
    setEditingTaskId(null);
    setEditingTitle("");
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent, taskId: string) => {
    if (e.key === "Enter") {
      handleTitleSave(taskId);
    } else if (e.key === "Escape") {
      handleTitleCancel();
    }
  };

  const handleDescriptionClick = (
    taskId: string,
    currentDescription: string | null
  ) => {
    setEditingDescriptionId(taskId);
    setEditingDescription(currentDescription || "");
  };

  const handleDescriptionSave = (taskId: string) => {
    const trimmedDescription = editingDescription.trim();
    const currentTask = filteredTasks.find((t) => t.id === taskId);
    const currentDescription = currentTask?.description || "";

    if (trimmedDescription !== currentDescription) {
      updateTaskMutation.mutate({
        id: taskId,
        updates: { description: trimmedDescription || null },
      });
    }
    setEditingDescriptionId(null);
    setEditingDescription("");
  };

  const handleDescriptionCancel = () => {
    setEditingDescriptionId(null);
    setEditingDescription("");
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent, taskId: string) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleDescriptionSave(taskId);
    } else if (e.key === "Escape") {
      handleDescriptionCancel();
    }
  };

  const filteredTasks = statusFilter
    ? tasks.filter((task) => task.status === statusFilter)
    : tasks;

  if (isLoading) return <ComponentLoading message="Loading tasks..." />;

  if (error) {
    return (
      <div className="bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/20 text-destructive px-6 py-4 rounded-2xl shadow-sm backdrop-blur-sm">
        <p className="font-medium">Error loading tasks</p>
        <p className="text-sm opacity-75">{(error as Error).message}</p>
        <button
          onClick={() => refetch()}
          className="mt-3 bg-destructive/90 hover:bg-destructive text-destructive-foreground px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-xl border border-border/20 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border/30 bg-gradient-to-r from-muted/50 to-card/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-gradient-to-r from-primary to-primary/80 rounded-full"></div>
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              Tasks
            </h2>
            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-muted-foreground bg-muted/80 rounded-full border border-border/50">
              {filteredTasks.length}
            </span>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "TODO" | "IN_PROGRESS" | "COMPLETED" | ""
                )
              }
              className="text-sm border-border/50 rounded-xl focus:border-ring focus:ring-ring/20 focus:ring-2 text-foreground bg-background/90 backdrop-blur-sm shadow-sm px-3 py-2 font-medium transition-all duration-200"
            >
              <option value="">All Status</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-muted to-muted/80 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-muted-foreground font-medium">No tasks found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {statusFilter
                ? `No ${statusFilter.toLowerCase().replace('_', ' ')} tasks`
                : "Create your first task to get started!"}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="group bg-card/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-xl border border-border/30 hover:border-border/40 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <div className="mb-4">
                    {editingTaskId === task.id ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => handleTitleSave(task.id)}
                        onKeyDown={(e) => handleTitleKeyDown(e, task.id)}
                        className="font-semibold text-lg text-foreground bg-background border-2 border-ring rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-4 focus:ring-ring/20 transition-all duration-200"
                        autoFocus
                        disabled={updateTaskMutation.isPending}
                      />
                    ) : (
                      <h3
                        className="font-semibold text-lg text-foreground truncate cursor-pointer hover:text-primary transition-colors duration-200 leading-tight"
                        title={`${task.title} (click to edit)`}
                        onClick={() => handleTitleClick(task.id, task.title)}
                      >
                        {task.title}
                      </h3>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-3 mb-4">
                    {getStatusBadge(task.status)}
                    {getPriorityBadge(task.priority)}
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    {editingDescriptionId === task.id ? (
                      <textarea
                        value={editingDescription}
                        onChange={(e) => setEditingDescription(e.target.value)}
                        onBlur={() => handleDescriptionSave(task.id)}
                        onKeyDown={(e) => handleDescriptionKeyDown(e, task.id)}
                        className="text-muted-foreground text-sm bg-background border-2 border-ring rounded-xl px-3 py-2 w-full resize-none focus:outline-none focus:ring-4 focus:ring-ring/20 transition-all duration-200"
                        rows={3}
                        autoFocus
                        disabled={updateTaskMutation.isPending}
                        placeholder="Add description..."
                      />
                    ) : (
                      <p
                        className={`text-muted-foreground text-sm cursor-pointer hover:text-primary transition-colors duration-200 leading-relaxed ${
                          !task.description ? "italic text-muted-foreground/50" : ""
                        }`}
                        title={
                          task.description
                            ? `${task.description} (click to edit)`
                            : "Click to add description"
                        }
                        onClick={() =>
                          handleDescriptionClick(task.id, task.description)
                        }
                      >
                        {task.description || "No description (click to add)"}
                      </p>
                    )}
                  </div>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-medium">
                        {task.createdBy.name || task.createdBy.email}
                      </span>
                    </div>
                    {task.assignee && (
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        <span>
                          {task.assignee.name || task.assignee.email}
                        </span>
                      </div>
                    )}
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-start gap-2 flex-shrink-0">
                  <select
                    value={task.status}
                    onChange={(e) =>
                      handleStatusChange(
                        task.id,
                        e.target.value as "TODO" | "IN_PROGRESS" | "COMPLETED"
                      )
                    }
                    disabled={updateTaskMutation.isPending}
                    className="text-xs border-border/50 rounded-xl focus:border-ring focus:ring-ring/20 focus:ring-2 disabled:opacity-50 text-foreground bg-background/90 backdrop-blur-sm shadow-sm px-3 py-2 font-medium transition-all duration-200 min-w-0"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>

                  <button
                    onClick={() => handleDeleteTask(task.id, task.title)}
                    disabled={deleteTaskMutation.isPending}
                    className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 disabled:opacity-50 p-2 flex-shrink-0 rounded-xl transition-all duration-200 group-hover:opacity-100 opacity-0"
                    title="Delete task"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Loading states */}
      {(updateTaskMutation.isPending || deleteTaskMutation.isPending) && (
        <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/20 border-t border-primary/30 backdrop-blur-sm">
          <div className="flex items-center gap-3 text-primary text-sm">
            <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="font-medium">Updating task...</span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalTask && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="bg-card/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-border/50 p-8 w-full max-w-md mx-4 transform transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-destructive/10 to-destructive/20 rounded-2xl flex items-center justify-center shadow-sm">
                <svg
                  className="w-6 h-6 text-destructive"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Delete Task
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-foreground leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground bg-muted/80 px-2 py-1 rounded-lg">
                  &quot;{deleteModalTask.title}&quot;
                </span>
                ?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelDeleteTask}
                className="flex-1 bg-muted/80 hover:bg-muted text-foreground font-medium py-3 px-4 rounded-2xl transition-all duration-200 backdrop-blur-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTask}
                disabled={deleteTaskMutation.isPending}
                className="flex-1 bg-gradient-to-r from-destructive to-destructive/90 hover:from-destructive/90 hover:to-destructive text-destructive-foreground font-medium py-3 px-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {deleteTaskMutation.isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-destructive-foreground border-t-transparent rounded-full"></div>
                    <span>Deleting...</span>
                  </div>
                ) : (
                  "Delete Task"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
