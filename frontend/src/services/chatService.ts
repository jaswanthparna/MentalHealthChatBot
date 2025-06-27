interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  role?: 'user' | 'bot';
}

interface Conversation {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  title?: string;
}

interface BackendMessage {
  role: 'user' | 'bot';
  text: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export class ChatService {
  static async createNewConversation(userId: string, token: string, title: string = 'New Chat'): Promise<string> {
    console.log('Creating new conversation...', { userId, hasToken: !!token, title });
    
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/new?title=${encodeURIComponent(title)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      console.log('Create conversation response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create conversation:', response.status, errorData);
        throw new Error(errorData.message || `Failed to create conversation: ${response.status}`);
      }

      const data = await response.json();
      console.log('New conversation created:', data.conversation_id);
      return data.conversation_id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      // Fallback to local ID generation
      const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('Using fallback local ID:', localId);
      return localId;
    }
  }

  static async deleteConversation(conversationId: string, token: string): Promise<void> {
    console.log('Deleting conversation...', { conversationId, hasToken: !!token });
    
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      console.log('Delete conversation response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to delete conversation:', response.status, errorData);
        throw new Error(errorData.message || `Failed to delete conversation: ${response.status}`);
      }

      console.log('Conversation deleted successfully');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  static async saveMessage(
    conversationId: string,
    message: BackendMessage,
    token: string
  ): Promise<void> {
    console.log('Saving message...', { conversationId, messageRole: message.role, hasToken: !!token });
    
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(message),
      });

      console.log('Save message response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to save message:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error saving message:', error);
      // Fallback to local storage
      this.saveToLocalStorage(conversationId, message);
    }
  }

  static async loadConversation(conversationId: string, token: string): Promise<ChatMessage[]> {
    console.log('Loading conversation...', { conversationId, hasToken: !!token });
    
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      console.log('Load conversation response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to load conversation:', response.status, errorData);
        throw new Error(errorData.message || `Failed to load conversation: ${response.status}`);
      }

      const data = await response.json();
      const backendMessages = data.conversation?.messages || [];
      
      console.log('Loaded messages count:', backendMessages.length);
      
      // Convert backend messages to frontend format
      return backendMessages.map((msg: BackendMessage, index: number) => ({
        id: `${conversationId}_${index}`,
        text: msg.text,
        isUser: msg.role === 'user',
        timestamp: new Date(),
        role: msg.role,
      }));
    } catch (error) {
      console.error('Error loading conversation:', error);
      // Fallback to local storage
      return this.loadFromLocalStorage(conversationId);
    }
  }

  static async getUserConversations(userId: string, token: string): Promise<Conversation[]> {
    console.log('Loading user conversations...', { userId, hasToken: !!token });
    
    try {
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      console.log('Load conversations response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to load conversations:', response.status, errorData);
        throw new Error(errorData.message || `Failed to load conversations: ${response.status}`);
      }

      const data = await response.json();
      const backendConversations = data.conversations || [];
      
      console.log('Loaded conversations count:', backendConversations.length);
      
      // Convert backend conversations to frontend format
      return backendConversations.map((conv: any) => ({
        id: conv.conversation_id,
        userId: conv.user_id,
        messages: conv.messages.map((msg: BackendMessage, index: number) => ({
          id: `${conv.conversation_id}_${index}`,
          text: msg.text,
          isUser: msg.role === 'user',
          timestamp: new Date(conv.created_at),
          role: msg.role,
        })),
        createdAt: new Date(conv.created_at),
        updatedAt: new Date(conv.created_at),
        title: conv.title || 'Untitled Chat',
      }));
    } catch (error) {
      console.error('Error loading conversations:', error);
      return [];
    }
  }

  static async sendChatbotQuery(query: string, conversationId: string | null, token: string): Promise<{
    response: string;
    conversationId: string;
    isCrisis?: boolean;
    contacts?: any[];
  }> {
    console.log('Sending chatbot query...', { 
      queryLength: query.length, 
      conversationId, 
      hasToken: !!token,
      apiBaseUrl: API_BASE_URL 
    });

    // Validate inputs
    if (!query || query.trim().length === 0) {
      throw new Error('Query cannot be empty');
    }

    if (!token) {
      throw new Error('Authentication token is required');
    }

    try {
      const requestBody = {
        query: query.trim(),
        conversation_id: conversationId,
      };

      console.log('Request body:', requestBody);

      const response = await fetch(`${API_BASE_URL}/chatbot/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Chatbot query response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Chatbot query failed:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          url: `${API_BASE_URL}/chatbot/query`
        });
        
        // Provide more specific error messages
        if (response.status === 401) {
          throw new Error('Authentication failed. Please try logging in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Please check your permissions.');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else if (response.status >= 500) {
          throw new Error(`Server error (${response.status}). The backend service may be temporarily unavailable.`);
        } else {
          throw new Error(errorData.message || `Request failed with status ${response.status}: ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('Chatbot response received:', {
        hasResponse: !!data.response,
        responseLength: data.response?.length || 0,
        conversationId: data.conversation_id,
        isCrisis: data.crisis,
        contactsCount: data.contacts?.length || 0
      });
      
      return {
        response: data.response || 'No response received from the chatbot.',
        conversationId: data.conversation_id || conversationId || `fallback_${Date.now()}`,
        isCrisis: data.crisis || false,
        contacts: data.contacts || [],
      };
    } catch (error) {
      console.error('Error sending chatbot query:', error);
      
      // Re-throw the error with additional context
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Network error: Unable to connect to the server at ${API_BASE_URL}. Please check your internet connection and try again.`);
      }
      
      throw error;
    }
  }

  // Local storage fallback methods
  private static saveToLocalStorage(conversationId: string, message: BackendMessage): void {
    console.log('Saving to localStorage as fallback...', { conversationId, messageRole: message.role });
    
    try {
      const key = `chat_${conversationId}`;
      const existing = localStorage.getItem(key);
      const messages = existing ? JSON.parse(existing) : [];
      messages.push({
        id: Date.now().toString(),
        text: message.text,
        isUser: message.role === 'user',
        timestamp: new Date(),
        role: message.role,
      });
      localStorage.setItem(key, JSON.stringify(messages));
      console.log('Message saved to localStorage successfully');
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  private static loadFromLocalStorage(conversationId: string): ChatMessage[] {
    console.log('Loading from localStorage as fallback...', { conversationId });
    
    try {
      const key = `chat_${conversationId}`;
      const stored = localStorage.getItem(key);
      const messages = stored ? JSON.parse(stored) : [];
      console.log('Loaded messages from localStorage:', messages.length);
      return messages;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return [];
    }
  }
}
