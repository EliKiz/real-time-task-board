interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
}

export const ChatInput = ({
  message,
  setMessage,
  onSubmit,
  disabled = false,
}: ChatInputProps) => {
  return (
    <div className="p-6 border-t border-border/30 bg-gradient-to-r from-muted/30 to-card/50">
      <form onSubmit={onSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={disabled}
            className="w-full px-4 py-3 bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md focus:shadow-md"
          />

          {message.length > 0 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <span
                className={`text-xs font-medium ${
                  message.length > 200 ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {message.length}/500
              </span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!message.trim() || disabled || message.length > 500}
          className="group flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-medium rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-primary/25 border border-primary/20"
        >
          <svg
            className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
          <span className="ml-2 hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
