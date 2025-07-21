import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import { prisma } from "@/shared/lib/db";

interface ChatWebSocket extends WebSocket {
  userId?: string;
  userName?: string;
  userRole?: string;
  isAlive?: boolean;
}

interface ChatMessage {
  type: "message" | "user_joined" | "user_left" | "error" | "auth_success" | "user_count_update";
  id?: string;
  content?: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
  createdAt?: string;
  message?: string;
  onlineCount?: number;
}

class ChatWebSocketServer {
  private wss: WebSocketServer;
  private clients: Set<ChatWebSocket> = new Set();
  private recentDisconnections: Map<string, number> = new Map();

  constructor(port: number = 3001) {
    const server = createServer();

    this.wss = new WebSocketServer({
      server,
      path: "/chat",
    });

    this.setupWebSocketHandlers();
    this.setupHeartbeat();

    server.listen(port, () => {
      console.log(`🚀 WebSocket server running on ws://localhost:${port}/chat`);
      console.log(`📊 Server ready to accept connections`);
    });
  }

  private setupWebSocketHandlers() {
    this.wss.on("connection", (ws: ChatWebSocket, request) => {
      console.log("📱 New WebSocket connection");

      ws.isAlive = true;
      this.clients.add(ws);

      ws.on("pong", () => {
        ws.isAlive = true;
      });

      ws.on("message", async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(ws, message);
        } catch (error) {
          console.error("❌ Error parsing message:", error);
          this.sendToClient(ws, {
            type: "error",
            message: "Invalid message format",
          });
        }
      });

      ws.on("close", () => {
        console.log("📴 WebSocket disconnected");
        this.clients.delete(ws);

        if (ws.userName && ws.userId) {
          const userStillConnected = Array.from(this.clients).some(client => 
            client.userId === ws.userId && client !== ws
          );

          if (!userStillConnected) {
            this.recentDisconnections.set(ws.userId, Date.now());
            
            console.log(`👋 ${ws.userName} left the chat`);
            this.broadcastToAll({
              type: "user_left",
              message: `${ws.userName} left the chat`,
            });
            
            setTimeout(() => {
              this.recentDisconnections.delete(ws.userId!);
            }, 10000);
          } else {
            console.log(`🔄 Connection replacement for ${ws.userName} - user still connected`);
          }

          setTimeout(() => {
            this.broadcastUserCount();
          }, 100);
        }
      });

      ws.on("error", (error) => {
        console.error("❌ WebSocket error:", error);
        this.clients.delete(ws);
      });
    });
  }

  private async handleMessage(
    ws: ChatWebSocket,
    message: Record<string, unknown>
  ) {
    switch (message.type) {
      case "auth":
        await this.handleAuth(ws, message);
        break;

      case "send_message":
        await this.handleSendMessage(ws, message);
        break;

      default:
        this.sendToClient(ws, {
          type: "error",
          message: "Unknown message type",
        });
    }
  }

  private async handleAuth(
    ws: ChatWebSocket,
    message: Record<string, unknown>
  ) {
    try {
      const { userEmail, userName, userRole } = message as {
        userEmail: string;
        userName: string;
        userRole: string;
      };

      console.log("🔍 Auth attempt:", { userEmail, userName, userRole });

      if (!userEmail || !userName) {
        console.log("❌ Missing credentials:", { userEmail, userName });
        this.sendToClient(ws, {
          type: "error",
          message: "Missing user credentials",
        });
        return;
      }

      console.log("🔎 Looking up user by email:", userEmail);
      const user = await prisma.user.findUnique({
        where: { email: userEmail as string },
        select: { id: true, name: true, email: true, role: true },
      });

      console.log("👤 User lookup result:", user);

      if (!user) {
        console.log("❌ User not found in database for email:", userEmail);

        const allUsers = await prisma.user.findMany({
          select: { id: true, email: true, name: true },
        });
        console.log("📋 All users in database:", allUsers);

        this.sendToClient(ws, {
          type: "error",
          message: "User not found in database",
        });
        return;
      }

      const existingConnections = Array.from(this.clients).filter(
        client => client.userId === user.id && client !== ws
      );
      
      if (existingConnections.length > 0) {
        console.log(`🔄 Closing ${existingConnections.length} existing connections for user ${user.name}`);
        existingConnections.forEach(oldWs => {
          this.clients.delete(oldWs);
          oldWs.close();
        });
      }

      ws.userId = user.id;
      ws.userName = user.name || user.email;
      ws.userRole = user.role;

      console.log(`✅ User authenticated: ${userName} (${userRole})`);

      const recentDisconnectTime = this.recentDisconnections.get(user.id);
      const isReconnection = recentDisconnectTime && (Date.now() - recentDisconnectTime) < 5000;

      if (isReconnection) {
        console.log(`🔄 Quick reconnection for ${userName} - not broadcasting join`);
        this.recentDisconnections.delete(user.id);
      } else {
        console.log(`👋 ${userName} joined the chat`);
        this.broadcastToOthers(ws, {
          type: "user_joined",
          message: `${userName} joined the chat`,
        });
      }

      this.sendToClient(ws, {
        type: "auth_success",
        message: "Successfully authenticated",
      });
      
      setTimeout(() => {
        this.broadcastUserCount();
      }, 100);
    } catch (error) {
      console.error("❌ Auth error:", error);
      this.sendToClient(ws, {
        type: "error",
        message: "Authentication failed",
      });
    }
  }

  private async handleSendMessage(
    ws: ChatWebSocket,
    message: Record<string, unknown>
  ) {
    try {
      if (!ws.userId) {
        this.sendToClient(ws, {
          type: "error",
          message: "Not authenticated",
        });
        return;
      }

      const { content } = message as { content: string };

      if (!content || content.trim().length === 0) {
        this.sendToClient(ws, {
          type: "error",
          message: "Message content is required",
        });
        return;
      }

      const savedMessage = await prisma.chatMessage.create({
        data: {
          content: content.trim(),
          userId: ws.userId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      this.broadcastToAll({
        type: "message",
        id: savedMessage.id,
        content: savedMessage.content,
        user: savedMessage.user,
        createdAt: savedMessage.createdAt.toISOString(),
      });
    } catch (error) {
      console.error("❌ Send message error:", error);
      this.sendToClient(ws, {
        type: "error",
        message: "Failed to send message",
      });
    }
  }

  private sendToClient(ws: ChatWebSocket, message: ChatMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private broadcastToAll(message: ChatMessage) {
    this.clients.forEach((client) => {
      this.sendToClient(client, message);
    });
  }

  private broadcastToOthers(sender: ChatWebSocket, message: ChatMessage) {
    this.clients.forEach((client) => {
      if (client !== sender) {
        this.sendToClient(client, message);
      }
    });
  }

  private broadcastUserCount() {
    const allClients = Array.from(this.clients);
    const authenticatedClients = allClients.filter(client => client.userId);
    const onlineCount = authenticatedClients.length;
    
    console.log(`👥 Online users: ${onlineCount}`);
    
    this.broadcastToAll({
      type: "user_count_update",
      onlineCount: onlineCount,
    });
  }

  private setupHeartbeat() {
    setInterval(() => {
      this.clients.forEach((ws) => {
        if (!ws.isAlive) {
          console.log(`💔 Terminating dead connection for ${ws.userName || 'unknown'}`);
          ws.terminate();
          this.clients.delete(ws);
          return;
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 60000);

    setInterval(() => {
      const now = Date.now();
      for (const [userId, timestamp] of this.recentDisconnections.entries()) {
        if (now - timestamp > 300000) {
          this.recentDisconnections.delete(userId);
        }
      }
      
      if (this.recentDisconnections.size > 0) {
        console.log(`🧹 Cleaned old disconnect records, remaining: ${this.recentDisconnections.size}`);
      }
    }, 300000);
  }
}

export { ChatWebSocketServer };

let wsServer: ChatWebSocketServer | null = null;

export function initializeWebSocketServer() {
  if (!wsServer) {
    wsServer = new ChatWebSocketServer(3001);
  }
  return wsServer;
}
