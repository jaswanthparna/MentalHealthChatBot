interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  messages: Message[];
  title: string;
  lastActivity: Date;
}

export class ChatPersistenceService {
  private static readonly CURRENT_CHAT_KEY = 'currentChatSession';
  private static readonly CHAT_HISTORY_KEY = 'chatHistory';

  static saveCurrentChat(messages: Message[], conversationId: string | null, title?: string): void {
    if (!conversationId || messages.length === 0) return;

    try {
      const chatSession: ChatSession = {
        id: conversationId,
        messages,
        title: title || this.generateTitleFromFirstMessage(messages),
        lastActivity: new Date(),
      };

      localStorage.setItem(this.CURRENT_CHAT_KEY, JSON.stringify(chatSession));
      console.log('Current chat saved:', { id: conversationId, messageCount: messages.length, title: chatSession.title });
    } catch (error) {
      console.error('Failed to save current chat:', error);
    }
  }

  static loadCurrentChat(): ChatSession | null {
    try {
      const stored = localStorage.getItem(this.CURRENT_CHAT_KEY);
      if (!stored) return null;

      const chatSession = JSON.parse(stored);
      // Convert timestamp strings back to Date objects
      chatSession.messages = chatSession.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
      chatSession.lastActivity = new Date(chatSession.lastActivity);

      console.log('Current chat loaded:', { id: chatSession.id, messageCount: chatSession.messages.length, title: chatSession.title });
      return chatSession;
    } catch (error) {
      console.error('Failed to load current chat:', error);
      return null;
    }
  }

  static clearCurrentChat(): void {
    try {
      localStorage.removeItem(this.CURRENT_CHAT_KEY);
      console.log('Current chat cleared');
    } catch (error) {
      console.error('Failed to clear current chat:', error);
    }
  }

  static generateTitleFromFirstMessage(messages: Message[]): string {
    const firstUserMessage = messages.find(msg => msg.isUser);
    if (!firstUserMessage) return 'New Chat';

    const title = firstUserMessage.text.trim();
    // Limit title length and clean it up
    return title.length > 50 ? title.substring(0, 47) + '...' : title;
  }

  static saveChatToHistory(session: ChatSession): void {
    try {
      const stored = localStorage.getItem(this.CHAT_HISTORY_KEY);
      const history: ChatSession[] = stored ? JSON.parse(stored) : [];

      // Remove any existing session with the same ID
      const filteredHistory = history.filter(chat => chat.id !== session.id);
      
      // Add the current session to the beginning
      filteredHistory.unshift(session);

      // Keep only the last 50 chats
      const limitedHistory = filteredHistory.slice(0, 50);

      localStorage.setItem(this.CHAT_HISTORY_KEY, JSON.stringify(limitedHistory));
      console.log('Chat saved to history:', { id: session.id, title: session.title });
    } catch (error) {
      console.error('Failed to save chat to history:', error);
    }
  }
}
