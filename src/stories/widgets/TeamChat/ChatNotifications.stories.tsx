import React, { useState } from 'react';
import { ChatNotifications } from '../../../widgets/TeamChat/ui/ChatNotifications';

interface ChatNotification {
  id: string;
  message: string;
  type: 'joined' | 'left';
  timestamp: number;
}

const meta = {
  title: 'Widgets/TeamChat/ChatNotifications',
  component: ChatNotifications,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'gray',
    },
  },
};

export default meta;

// Interactive example
const NotificationsWrapper = () => {
  const [notifications, setNotifications] = useState<ChatNotification[]>([
    {
      id: '1',
      message: 'Илья Князев joined the chat',
      type: 'joined',
      timestamp: Date.now(),
    },
    {
      id: '2', 
      message: 'Admin User left the chat',
      type: 'left',
      timestamp: Date.now() - 1000,
    },
  ]);

  const handleRemoveNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="h-screen bg-gray-100 relative">
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Chat Notifications Demo</h1>
        <p className="text-gray-600 mb-4">
          Apple-style notifications appear in the top-right corner
        </p>
        <button
          onClick={() => {
            const newNotification: ChatNotification = {
              id: Date.now().toString(),
              message: `User ${Math.floor(Math.random() * 100)} joined the chat`,
              type: 'joined',
              timestamp: Date.now(),
            };
            setNotifications(prev => [...prev, newNotification]);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-2"
        >
          Add Join Notification
        </button>
        <button
          onClick={() => {
            const newNotification: ChatNotification = {
              id: Date.now().toString(),
              message: `User ${Math.floor(Math.random() * 100)} left the chat`,
              type: 'left',
              timestamp: Date.now(),
            };
            setNotifications(prev => [...prev, newNotification]);
          }}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg"
        >
          Add Leave Notification
        </button>
      </div>

      <ChatNotifications 
        notifications={notifications}
        onRemoveNotification={handleRemoveNotification}
      />
    </div>
  );
};

export const Default = () => <NotificationsWrapper />;

export const NoNotifications = {
  args: {
    notifications: [],
    onRemoveNotification: () => {},
  },
};

export const SingleJoinNotification = {
  args: {
    notifications: [
      {
        id: '1',
        message: 'Илья Князев joined the chat',
        type: 'joined',
        timestamp: Date.now(),
      },
    ],
    onRemoveNotification: () => {},
  },
}; 