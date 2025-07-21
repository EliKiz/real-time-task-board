import React, { useState } from 'react';
import { ChatInput } from '../../../widgets/TeamChat/ui/ChatInput';



const meta = {
  title: 'Widgets/TeamChat/ChatInput',
  component: ChatInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Компонент ввода сообщений для чата с поддержкой валидации длины и интерактивными состояниями.',
      },
    },
  },
  argTypes: {
    message: { 
      control: 'text',
      description: 'Текущее значение сообщения',
    },
    setMessage: { 
      action: 'setMessage',
      description: 'Функция для изменения текста сообщения',
    },
    onSubmit: { 
      action: 'onSubmit',
      description: 'Обработчик отправки формы',
    },
    disabled: { 
      control: 'boolean',
      description: 'Отключает ввод и кнопку отправки',
    },
  },
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  args: {
    message: '',
    setMessage: () => {},
    onSubmit: () => {},
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Базовое состояние компонента - пустой ввод с неактивной кнопкой отправки.',
      },
    },
  },
};

export const WithText = {
  args: {
    message: 'Привет! Как дела?',
    setMessage: () => {},
    onSubmit: () => {},
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Состояние с текстом - кнопка отправки активна.',
      },
    },
  },
};

export const Disabled = {
  args: {
    message: 'Это сообщение нельзя отправить',
    setMessage: () => {},
    onSubmit: () => {},
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Отключенное состояние - ввод и кнопка неактивны.',
      },
    },
  },
};

export const LongText = {
  args: {
    message: 'Это довольно длинное сообщение, которое демонстрирует счетчик символов. Когда пользователь набирает больше определенного количества символов, появляется индикатор с количеством символов для контроля длины сообщения.',
    setMessage: () => {},
    onSubmit: () => {},
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Длинный текст показывает счетчик символов (появляется автоматически при вводе).',
      },
    },
  },
};

export const VeryLongText = {
  args: {
    message: 'Это очень длинное сообщение, которое превышает рекомендуемую длину в 200 символов. Счетчик становится красным, предупреждая пользователя о том, что сообщение слишком длинное и его следует сократить для лучшей читаемости.',
    setMessage: () => {},
    onSubmit: () => {},
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Очень длинный текст (>200 символов) - счетчик становится красным для предупреждения.',
      },
    },
  },
};

export const ExceedsLimit = {
  args: {
    message: 'Это сообщение превышает максимально допустимую длину в 500 символов. В таком случае кнопка отправки автоматически отключается, предотвращая отправку слишком длинного сообщения. Счетчик символов показывает красным цветом, что лимит превышен. Пользователю необходимо сократить текст перед отправкой. Это помогает поддерживать качество общения и избегать спама в чате. Кроме того, такое ограничение помогает сохранять производительность системы и улучшает пользовательский опыт всех участников чата.',
    setMessage: () => {},
    onSubmit: () => {},
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Превышение лимита (>500 символов) - кнопка отправки автоматически отключается.',
      },
    },
  },
};

export const Interactive = {
  render: () => {
    const [message, setMessage] = useState('');
    const [sentMessages, setSentMessages] = useState<Array<{id: number, text: string, timestamp: Date}>>([]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (message.trim() && message.length <= 500) {
        setSentMessages(prev => [...prev, {
          id: Date.now(),
          text: message,
          timestamp: new Date()
        }]);
        setMessage('');
      }
    };

    return (
      <div className="w-full max-w-2xl space-y-4">
        <ChatInput
          message={message}
          setMessage={setMessage}
          onSubmit={handleSubmit}
          disabled={false}
        />
        
        {sentMessages.length > 0 && (
          <div className="p-4 bg-blue-50 rounded-lg max-h-60 overflow-y-auto">
            <h4 className="font-semibold mb-3 text-gray-800">Отправленные сообщения:</h4>
            <div className="space-y-2">
              {sentMessages.map((msg) => (
                <div key={msg.id} className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-blue-400">
                  <p className="text-gray-700 mb-1">{msg.text}</p>
                  <span className="text-xs text-gray-500">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <strong>Инструкция:</strong> Введите сообщение и нажмите Enter или кнопку для отправки. 
          Следите за счетчиком символов при длинных сообщениях.
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Полностью интерактивный пример - можно вводить текст, отправлять сообщения и видеть историю.',
      },
    },
  },
};

export const KeyboardNavigation = {
  render: () => {
    const [message, setMessage] = useState('');
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (action: string) => {
      setLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${action}`]);
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (message.trim()) {
        const quotedMessage = `Отправлено: ${JSON.stringify(message)}`;
        addLog(quotedMessage);
        setMessage('');
      }
    };

    const handleMessageChange = (newMessage: string) => {
      setMessage(newMessage);
      if (newMessage.length > 0 && message.length === 0) {
        addLog('Начал вводить текст');
      }
    };

    return (
      <div className="w-full max-w-2xl space-y-4">
        <ChatInput
          message={message}
          setMessage={handleMessageChange}
          onSubmit={handleSubmit}
          disabled={false}
        />
        
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold mb-2 text-gray-800">Лог действий:</h4>
          <div className="space-y-1 text-sm text-gray-600 font-mono">
            {logs.length === 0 ? (
              <p className="text-gray-500">Начните вводить текст...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))
            )}
          </div>
        </div>

        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <strong>Тестирование клавиатуры:</strong>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>Enter - отправка сообщения</li>
            <li>Tab - переход между элементами</li>
            <li>Esc - снятие фокуса</li>
          </ul>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Демонстрация клавиатурной навигации и логирования действий пользователя.',
      },
    },
  },
};

export const ValidationStates = {
  render: () => {
    const [currentMessage, setCurrentMessage] = useState('');
    
    const testMessages = [
      { label: 'Пустое', value: '', description: 'Кнопка отключена' },
      { label: 'Короткое', value: 'Привет!', description: 'Валидное сообщение' },
      { label: 'Среднее', value: 'Это сообщение средней длины для демонстрации нормального состояния компонента.', description: 'Показывает счетчик' },
      { label: 'Длинное', value: 'Это довольно длинное сообщение, которое превышает рекомендуемую длину в 200 символов. Счетчик становится красным, предупреждая пользователя о том, что сообщение слишком длинное и его следует сократить.', description: 'Красный счетчик' },
      { label: 'Слишком длинное', value: 'Это сообщение превышает максимально допустимую длину в 500 символов. В таком случае кнопка отправки автоматически отключается, предотвращая отправку слишком длинного сообщения. Счетчик символов показывает красным цветом, что лимит превышен. Пользователю необходимо сократить текст перед отправкой. Это помогает поддерживать качество общения и избегать спама в чате. Кроме того, такое ограничение помогает сохранять производительность системы и улучшает пользовательский опыт всех участников чата системы.', description: 'Кнопка отключена' },
    ];

    return (
      <div className="w-full max-w-2xl space-y-6">
        <ChatInput
          message={currentMessage}
          setMessage={setCurrentMessage}
          onSubmit={(e) => e.preventDefault()}
          disabled={false}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {testMessages.map((test, index) => (
            <button
              key={index}
              onClick={() => setCurrentMessage(test.value)}
              className="p-3 text-left bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <div className="font-medium text-gray-800">{test.label}</div>
              <div className="text-sm text-gray-600 mt-1">{test.description}</div>
              <div className="text-xs text-gray-500 mt-1">
                {test.value.length} символов
              </div>
            </button>
          ))}
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold mb-2">Текущее состояние:</h4>
          <div className="text-sm space-y-1">
            <div>Длина: <span className="font-mono">{currentMessage.length}/500</span></div>
            <div>Валидность: <span className={`font-medium ${currentMessage.trim() && currentMessage.length <= 500 ? 'text-green-600' : 'text-red-600'}`}>
              {currentMessage.trim() && currentMessage.length <= 500 ? 'Можно отправить' : 'Нельзя отправить'}
            </span></div>
            <div>Счетчик: <span className={`font-medium ${currentMessage.length > 200 ? 'text-red-600' : 'text-gray-600'}`}>
              {currentMessage.length > 0 ? 'Показан' : 'Скрыт'}
            </span></div>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Демонстрация всех состояний валидации с быстрым переключением между тестовыми сообщениями.',
      },
    },
  },
}; 