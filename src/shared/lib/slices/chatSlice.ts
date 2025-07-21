import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessage } from '@/entities/chat/model/types';

interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  wsConnected: boolean;
  webSocket: WebSocket | null;
  message: string;
}

const initialState: ChatState = {
  messages: [],
  loading: false,
  error: null,
  wsConnected: false,
  webSocket: null,
  message: '',
};

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/chat');
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      return data.messages;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const clearChat = createAsyncThunk(
  'chat/clearChat',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/chat/clear', {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to clear chat');
      }
      return response.json();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      const exists = state.messages.some(msg => msg.id === action.payload.id);
      if (!exists) {
        state.messages.push(action.payload);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setWsConnected: (state, action: PayloadAction<boolean>) => {
      state.wsConnected = action.payload;
    },
    setWebSocket: (state, action: PayloadAction<WebSocket | null>) => {
      state.webSocket = action.payload;
    },
    setMessage: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(clearChat.fulfilled, (state) => {
        state.messages = [];
      });
  },
});

export const {
  setMessages,
  addMessage,
  setLoading,
  setError,
  setWsConnected,
  setWebSocket,
  setMessage,
  clearMessages,
} = chatSlice.actions;

export default chatSlice.reducer; 