interface ChatHeaderProps {
  wsConnected: boolean;
  onlineUsersCount: number;
  messagesCount: number;
  error: string | null;
  userRole: string;
  onClearChat: () => void;
  isClearingChat: boolean;
  clearChatError?: string;
}

export const ChatHeader = ({
  wsConnected,
  onlineUsersCount,
  messagesCount,
  error,
  userRole,
  onClearChat,
  isClearingChat,
  clearChatError,
}: ChatHeaderProps) => {
  return (
    <div className="p-6 border-b border-border/30 bg-gradient-to-r from-muted/50 to-card/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Connection Status Indicator */}
          <div className="relative">
            <div
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                wsConnected 
                  ? "bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-500/30" 
                  : "bg-gradient-to-r from-orange-400 to-yellow-500 shadow-lg shadow-orange-500/30"
              }`}
            >
              {wsConnected ? (
                <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>
              ) : (
                <div className="absolute inset-0 rounded-full bg-orange-400 animate-pulse opacity-75"></div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              Team Chat
            </h2>
            <div className="flex items-center gap-2 text-xs">
              <span className={`font-medium ${wsConnected ? 'text-green-600' : 'text-orange-600'}`}>
                {wsConnected ? '● Connected' : '● Reconnecting...'}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{onlineUsersCount} online</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{messagesCount} messages</span>
              {error && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-destructive">{error}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Admin Controls */}
        {userRole === "ADMIN" && (
          <button
            onClick={onClearChat}
            disabled={isClearingChat || messagesCount === 0}
            className="group flex items-center gap-2 px-3 py-2 text-xs font-medium text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            title={`Clear all ${messagesCount} messages (Admin only)`}
          >
            {isClearingChat ? (
              <>
                <div className="animate-spin w-3 h-3 border border-destructive border-t-transparent rounded-full"></div>
                <span>Clearing...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12"
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
                <span>Clear Chat</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Error Display */}
      {clearChatError && (
        <div className="mt-4 bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/20 text-destructive px-6 py-4 rounded-2xl shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">Failed to clear chat</p>
          </div>
          <p className="text-sm opacity-90">{clearChatError}</p>
        </div>
      )}
    </div>
  );
}; 