
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import ConversationList from '@/components/ConversationList';
import CrisisAlert from '@/components/CrisisAlert';
import { Send, Bot, User, Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { ChatService } from '@/services/chatService';
import { ChatPersistenceService } from '@/services/chatPersistenceService';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [showConversationList, setShowConversationList] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [crisisContacts, setCrisisContacts] = useState<any[]>([]);
  const [chatTitle, setChatTitle] = useState<string>('');
  const [isNewChat, setIsNewChat] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load existing chat on component mount
    loadExistingChat();
  }, []);

  // Save chat whenever messages change
  useEffect(() => {
    if (messages.length > 1 && currentConversationId) { // More than just the greeting
      ChatPersistenceService.saveCurrentChat(messages, currentConversationId, chatTitle);
    }
  }, [messages, currentConversationId, chatTitle]);

  const loadExistingChat = () => {
    console.log('Loading existing chat...');
    const existingChat = ChatPersistenceService.loadCurrentChat();
    
    if (existingChat && existingChat.messages.length > 1) {
      // Load existing chat
      setMessages(existingChat.messages);
      setCurrentConversationId(existingChat.id);
      setChatTitle(existingChat.title);
      setIsNewChat(false);
      console.log('Loaded existing chat:', existingChat.title);
    } else {
      // Start with greeting for new chat
      const greetingMessage: Message = {
        id: '1',
        text: "Hello! I'm here to listen and support you. How are you feeling today?",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([greetingMessage]);
      setIsNewChat(true);
      console.log('Started new chat with greeting');
    }
  };

  const handleVoiceResult = (transcript: string) => {
    setInputValue(transcript);
  };

  const handleVoiceError = (error: string) => {
    toast({
      title: "Voice Recognition Error",
      description: `Could not process voice input: ${error}`,
      variant: "destructive",
    });
  };

  const {
    isListening,
    isSupported: voiceSupported,
    startListening,
    stopListening,
  } = useVoiceInput({
    onResult: handleVoiceResult,
    onError: handleVoiceError,
  });

  const handleNewConversation = async () => {
    console.log('Starting new conversation...');
    
    // Save current chat to history if it has messages
    if (messages.length > 1 && currentConversationId) {
      const currentSession = {
        id: currentConversationId,
        messages,
        title: chatTitle || ChatPersistenceService.generateTitleFromFirstMessage(messages),
        lastActivity: new Date(),
      };
      ChatPersistenceService.saveChatToHistory(currentSession);
    }

    // Clear current chat
    ChatPersistenceService.clearCurrentChat();

    // Reset state for new chat
    const greetingMessage: Message = {
      id: '1',
      text: "Hello! I'm here to listen and support you. How are you feeling today?",
      isUser: false,
      timestamp: new Date(),
    };
    
    setMessages([greetingMessage]);
    setCurrentConversationId(null);
    setChatTitle('');
    setIsNewChat(true);
    
    toast({
      title: "New Chat Started",
      description: "Started a new conversation",
    });
  };

  const handleSelectConversation = async (conversationId: string) => {
    if (!user?.token) return;

    try {
      const conversationMessages = await ChatService.loadConversation(conversationId, user.token);
      setMessages(conversationMessages.length > 0 ? conversationMessages : [
        {
          id: '1',
          text: "Hello! I'm here to listen and support you. How are you feeling today?",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
      setCurrentConversationId(conversationId);
      setShowConversationList(false);
      setIsNewChat(false);
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || !user?.token) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    // If this is the first user message, generate a title
    if (isNewChat && !chatTitle) {
      const newTitle = ChatPersistenceService.generateTitleFromFirstMessage([userMessage]);
      setChatTitle(newTitle);
    }

    try {
      console.log('Sending chatbot query:', currentInput);
      
      // Create new conversation if needed
      let conversationId = currentConversationId;
      if (!conversationId && user?.id) {
        const titleForConversation = chatTitle || ChatPersistenceService.generateTitleFromFirstMessage([userMessage]);
        conversationId = await ChatService.createNewConversation(user.id, user.token, titleForConversation);
        setCurrentConversationId(conversationId);
        setIsNewChat(false);
      }

      const result = await ChatService.sendChatbotQuery(
        currentInput, 
        conversationId, 
        user.token
      );

      // Update conversation ID if it was created
      if (!currentConversationId) {
        setCurrentConversationId(result.conversationId);
        setIsNewChat(false);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: result.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);

      // Check for crisis response
      if (result.isCrisis) {
        setCrisisContacts(result.contacts || []);
        setShowCrisisAlert(true);
      }

    } catch (error) {
      console.error('Chat error:', error);
      
      let errorMessage = "Unable to connect to the chatbot. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      const errorMessage2: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage2]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />
      
      <CrisisAlert 
        isVisible={showCrisisAlert} 
        onClose={() => setShowCrisisAlert(false)}
        crisisContacts={crisisContacts}
      />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Conversation List */}
        {showConversationList && (
          <ConversationList
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            currentConversationId={currentConversationId}
          />
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="max-w-4xl mx-auto p-4 h-full w-full">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl h-full flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-indigo-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-semibold text-gray-800">
                        {chatTitle || 'Mindful Assistant'}
                      </h1>
                      <p className="text-sm text-gray-600">Your compassionate companion</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowConversationList(!showConversationList)}
                    >
                      {showConversationList ? 'Hide' : 'Show'} History
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNewConversation}
                    >
                      New Chat
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-3 max-w-[80%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.isUser 
                          ? 'bg-gradient-to-br from-green-400 to-blue-500' 
                          : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                      }`}>
                        {message.isUser ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                      
                      <Card className={`p-4 ${
                        message.isUser 
                          ? 'bg-gradient-to-br from-green-400 to-blue-500 text-white border-0' 
                          : 'bg-white shadow-md border-indigo-100'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.text}
                        </p>
                        <p className={`text-xs mt-2 ${
                          message.isUser ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </Card>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-3 max-w-[80%]">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <Card className="p-4 bg-white shadow-md border-indigo-100">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </Card>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-6 border-t border-indigo-100">
                <div className="flex space-x-3">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Share your thoughts..."
                    className="flex-1 border-indigo-200 focus:border-indigo-400 bg-white/70"
                    disabled={isLoading}
                  />
                  
                  {voiceSupported && (
                    <Button
                      variant="outline"
                      onClick={toggleVoiceInput}
                      disabled={isLoading}
                      className={`${isListening ? 'bg-red-100 border-red-300 text-red-600' : ''}`}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                  )}
                  
                  <Button
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    This is a supportive space. Remember, I'm here to listen, not to replace professional help.
                  </p>
                  {voiceSupported && (
                    <p className="text-xs text-gray-400">
                      {isListening ? '🎤 Listening...' : '🎤 Voice available'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
