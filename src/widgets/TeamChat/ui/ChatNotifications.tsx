interface ChatNotification {
  id: string;
  message: string;
  type: 'joined' | 'left';
  timestamp: number;
}

interface ChatNotificationsProps {
  notifications: ChatNotification[];
  onRemoveNotification: (id: string) => void;
}

export const ChatNotifications = ({ notifications, onRemoveNotification }: ChatNotificationsProps) => {
  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="group bg-card/95 backdrop-blur-xl rounded-2xl shadow-xl border border-border/30 min-w-[320px] animate-in slide-in-from-right-3 duration-300 pointer-events-auto overflow-hidden hover:shadow-2xl transition-all duration-200"
        >
          <div className={`h-1 ${
            notification.type === 'joined' 
              ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
              : 'bg-gradient-to-r from-orange-400 to-red-500'
          }`}>
            <div 
              className="h-full bg-white/30 animate-[progress_5s_linear]"
              style={{ animation: 'progress 5s linear forwards' }}
            ></div>
          </div>

          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${
                notification.type === 'joined' 
                  ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/30' 
                  : 'bg-gradient-to-br from-orange-400 to-red-500 shadow-lg shadow-orange-500/30'
              }`}>
                {notification.type === 'joined' ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                  </svg>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-foreground text-sm">
                    {notification.type === 'joined' ? 'User Joined' : 'User Left'}
                  </h4>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    notification.type === 'joined' ? 'bg-green-500' : 'bg-orange-500'
                  }`}></div>
                </div>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                  {notification.message}
                </p>
              </div>

              <button
                onClick={() => onRemoveNotification(notification.id)}
                className="w-7 h-7 rounded-xl bg-muted/70 hover:bg-muted/80 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 