"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { ComponentLoading } from "@/shared/ui/loading";
import { ChatMessage as ChatMessageType } from "@/entities/chat/model/types";
import { ChatNotifications } from "./ChatNotifications";
import { ChatMessage as ChatMessageComponent } from "./ChatMessage";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";

const api = {
  async getMessages(): Promise<ChatMessageType[]> {
    const response = await fetch("/api/chat");
    if (!response.ok) {
      throw new Error("Failed to fetch messages");
    }
    const data = await response.json();
    return data.messages;
  },

  async clearChat(): Promise<{ deletedCount: number }> {
    const response = await fetch("/api/chat/clear", {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to clear chat");
    }
    return response.json();
  },

  async getChatCount(): Promise<{ messageCount: number }> {
    const response = await fetch("/api/chat/clear");
    if (!response.ok) {
      throw new Error("Failed to get chat count");
    }
    return response.json();
  },
};

interface WebSocketMessage {
  type:
    | "message"
    | "user_joined"
    | "user_left"
    | "error"
    | "auth_success"
    | "user_count_update";
  id?: string;
  content?: string;
  user?: ChatMessageType["user"];
  createdAt?: string;
  message?: string;
  onlineCount?: number;
}

export const TeamChat = () => {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlineUsersCount, setOnlineUsersCount] = useState(0);
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      message: string;
      type: "joined" | "left";
      timestamp: number;
    }>
  >([]);
  const recentNotifications = useRef<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  const showNotification = (message: string, type: "joined" | "left") => {
    const actionText =
      type === "joined" ? " joined the chat" : " left the chat";
    const userName = message.replace(actionText, "").trim();

    const currentUserName =
      session?.user?.name || session?.user?.email?.split("@")[0];
    if (userName === currentUserName) {
      console.log(`🙈 Not showing notification for current user: ${userName}`);
      return;
    }

    const notificationKey = `${type}-${message}`;
    if (recentNotifications.current.has(notificationKey)) {
      console.log(`🚫 Debounced duplicate notification: ${message}`);
      return;
    }

    recentNotifications.current.add(notificationKey);
    setTimeout(() => {
      recentNotifications.current.delete(notificationKey);
    }, 8000);

    const id = `${Date.now()}-${Math.random()}`;
    const notification = {
      id,
      message,
      type,
      timestamp: Date.now(),
    };

    console.log(`✅ Showing notification: ${message}`);
    setNotifications((prev) => {
      const updated = [...prev, notification];
      return updated.slice(-3);
    });

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  const clearChatMutation = useMutation({
    mutationFn: api.clearChat,
    onSuccess: (data) => {
      setMessages([]);
      console.log(`✅ Chat cleared: ${data.deletedCount} messages deleted`);
    },
    onError: (error: Error) => {
      console.error("Clear chat error:", error.message);
    },
  });

  const {
    data: initialMessages = [],
    isLoading: historyLoading,
    error: historyError,
  } = useQuery({
    queryKey: ["chat-messages-history"],
    queryFn: api.getMessages,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const initializeWebSocket = useCallback(async () => {
    const currentSession = session;
    if (!currentSession?.user?.id) {
      return;
    }

    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        console.log("🔄 Active WebSocket connection already exists, skipping");
        return;
      }

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      const initResponse = await fetch("/api/websocket");
      const ws = new WebSocket("ws://localhost:3001/chat");
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WebSocket connected");
        setWsConnected(true);
        setError(null);

        const authData = {
          type: "auth",
          userEmail: currentSession.user.email,
          userName: currentSession.user.name || currentSession.user.email,
          userRole: currentSession.user.role,
        };
        ws.send(JSON.stringify(authData));
      };

      ws.onmessage = (event) => {
        try {
          const wsMessage: WebSocketMessage = JSON.parse(event.data);

          switch (wsMessage.type) {
            case "message":
              if (
                wsMessage.id &&
                wsMessage.content &&
                wsMessage.user &&
                wsMessage.createdAt
              ) {
                const newMessage: ChatMessageType = {
                  id: wsMessage.id,
                  content: wsMessage.content,
                  user: wsMessage.user,
                  createdAt: wsMessage.createdAt,
                };

                setMessages((prev) => {
                  const exists = prev.some((msg) => msg.id === newMessage.id);
                  if (exists) {
                    return prev;
                  }
                  return [...prev, newMessage];
                });
              }
              break;

            case "user_joined":
              if (wsMessage.message) {
                console.log(wsMessage.message);
                showNotification(wsMessage.message, "joined");
              }
              break;

            case "user_left":
              if (wsMessage.message) {
                console.log(wsMessage.message);
                showNotification(wsMessage.message, "left");
              }
              break;

            case "user_count_update":
              if (wsMessage.onlineCount !== undefined) {
                setOnlineUsersCount(wsMessage.onlineCount);
              }
              break;

            case "auth_success":
              break;

            case "error":
              setError(wsMessage.message || "WebSocket error");
              break;
          }
        } catch (error) {
          console.error("❌ Error parsing WebSocket message:", error);
        }
      };

      ws.onclose = (event) => {
        console.log("❌ WebSocket disconnected:", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });

        if (event.code !== 1005) {
          setWsConnected(false);
        }
        setError(null);

        if (
          event.code !== 1000 &&
          event.code !== 1005 &&
          currentSession?.user?.id
        ) {
          setTimeout(() => {
            console.log("🔄 Attempting reconnection...");
            initializeWebSocket();
          }, 3000);
        } else {
          console.log(
            "⭕ Not reconnecting - normal closure or server replacement"
          );
        }
      };

      ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        setWsConnected(false);
        setError("WebSocket error occurred");
      };
    } catch (error) {
      console.error("❌ Failed to initialize WebSocket:", error);
      setWsConnected(false);
      setError("Failed to initialize connection");
    }
  }, [
    session?.user?.id,
    session?.user?.email,
    session?.user?.name,
    session?.user?.role,
  ]);

  useEffect(() => {
    if (session?.user?.id) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      initializeWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [session?.user?.id]);

  useEffect(() => {
    if (initialMessages.length > 0 && messages.length === 0) {
      setMessages(initialMessages);
      setIsLoading(false);
    } else if (!historyLoading && messages.length === 0) {
      setIsLoading(false);
    }
  }, [initialMessages, historyLoading, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    if (!wsRef.current || !wsConnected) {
      return;
    }

    const messageData = {
      type: "send_message",
      content: message.trim(),
    };
    wsRef.current.send(JSON.stringify(messageData));

    setMessage("");
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserDisplayName = (user: ChatMessageType["user"]) => {
    return user.name || user.email.split("@")[0];
  };

  const isMyMessage = (userId: string) => {
    return session?.user?.id === userId;
  };

  if (historyLoading || isLoading) {
    return <ComponentLoading message="Loading chat..." />;
  }

  if (historyError && !wsConnected) {
    return (
      <div className="bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/20 text-destructive px-6 py-4 rounded-2xl shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-3">
          <svg
            className="w-5 h-5 text-destructive"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="font-medium">Error loading chat</p>
        </div>
        <p className="text-sm opacity-75 mb-4">
          {(historyError as Error).message}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-destructive/90 hover:bg-destructive text-destructive-foreground px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-xl border border-border/20 h-full flex flex-col overflow-hidden">
      <ChatHeader
        wsConnected={wsConnected}
        onlineUsersCount={onlineUsersCount}
        messagesCount={messages.length}
        error={error}
        userRole={session?.user?.role || ""}
        onClearChat={() => clearChatMutation.mutate()}
        isClearingChat={clearChatMutation.isPending}
        clearChatError={clearChatMutation.error?.message}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-muted/20 to-transparent">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-muted-foreground font-medium mb-1">No messages yet</p>
            <p className="text-sm text-muted-foreground/70">
              Start the conversation with your team!
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isFromMe = isMyMessage(msg.user.id);
            const showAvatar =
              !isFromMe &&
              (index === 0 || messages[index - 1].user.id !== msg.user.id);

            return (
              <ChatMessageComponent
                key={msg.id}
                message={msg}
                isFromMe={isFromMe}
                showAvatar={showAvatar}
                onFormatTime={formatTime}
                onGetUserDisplayName={getUserDisplayName}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        message={message}
        setMessage={setMessage}
        onSubmit={handleSubmit}
        disabled={!wsConnected}
      />

      {clearChatMutation.isSuccess && (
        <div className="absolute inset-x-4 top-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-2xl shadow-lg backdrop-blur-xl border border-white/20 transform transition-all duration-300 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="font-semibold">Chat cleared successfully!</p>
              <p className="text-sm opacity-90">
                All messages have been removed.
              </p>
            </div>
          </div>
        </div>
      )}

      {clearChatMutation.isError && (
        <div className="absolute inset-x-4 top-4 bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground p-4 rounded-2xl shadow-lg backdrop-blur-xl border border-destructive/20 transform transition-all duration-300 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="font-semibold">Failed to clear chat</p>
              <p className="text-sm opacity-90">
                {clearChatMutation.error?.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <ChatNotifications
        notifications={notifications}
        onRemoveNotification={(id) =>
          setNotifications((prev) => prev.filter((n) => n.id !== id))
        }
      />
    </div>
  );
};
