import { ChatMessage as ChatMessageType } from "@/entities/chat/model/types";

interface ChatMessageProps {
  message: ChatMessageType;
  isFromMe: boolean;
  showAvatar: boolean;
  onFormatTime: (dateString: string) => string;
  onGetUserDisplayName: (user: ChatMessageType["user"]) => string;
}

export const ChatMessage = ({ 
  message, 
  isFromMe, 
  showAvatar, 
  onFormatTime, 
  onGetUserDisplayName 
}: ChatMessageProps) => {
  return (
    <div
      className={`group flex gap-3 px-6 py-4 hover:bg-muted/50 transition-colors duration-200 ${
        isFromMe ? "flex-row-reverse" : ""
      }`}
    >
      <div
        className={`flex flex-col items-center gap-1 ${
          isFromMe ? "order-last" : ""
        }`}
      >
        {showAvatar && (
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-md">
            <span className="text-primary-foreground font-semibold text-xs">
              {onGetUserDisplayName(message.user)
                .charAt(0)
                .toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div
        className={`flex flex-col gap-1 max-w-xs ${
          isFromMe ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`flex flex-col ${
            isFromMe ? "order-last" : ""
          }`}
        >
          {!isFromMe && showAvatar && (
            <div className="flex items-center gap-1 mb-1 px-1">
              <span className="text-xs font-semibold text-muted-foreground">
                {onGetUserDisplayName(message.user)}
              </span>
              {message.user.role === "ADMIN" && (
                <span className="text-xs" title="Administrator">
                  👑
                </span>
              )}
            </div>
          )}

          <div
            className={`px-4 py-3 rounded-2xl shadow-sm backdrop-blur-sm border transition-all duration-200 group-hover:shadow-md ${
              isFromMe
                ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-primary/20 rounded-br-md"
                : "bg-card/90 text-foreground border-border/50 rounded-bl-md"
            }`}
          >
            <div
              className={`text-sm leading-relaxed font-medium ${
                isFromMe ? "text-primary-foreground" : "text-foreground"
              }`}
            >
              {message.content}
            </div>
          </div>

          <div
            className={`px-1 mt-1 ${
              isFromMe ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`text-xs font-medium transition-opacity duration-200 ${
                isFromMe
                  ? "text-primary group-hover:opacity-100 opacity-70"
                  : "text-muted-foreground group-hover:opacity-100 opacity-60"
              }`}
            >
              {onFormatTime(message.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}; 