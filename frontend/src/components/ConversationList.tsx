
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChatService } from '@/services/chatService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Plus, Calendar, Trash2, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Conversation {
  id: string;
  userId: string;
  messages: any[];
  createdAt: Date;
  updatedAt: Date;
  title?: string;
}

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  currentConversationId?: string | null;
}

const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  onNewConversation,
  currentConversationId,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    if (!user?.token || !user?.id) return;

    setIsLoading(true);
    try {
      const userConversations = await ChatService.getUserConversations(user.id, user.token);
      setConversations(userConversations);
      console.log('Loaded conversations:', userConversations.length);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    console.log('Deleting conversation:', conversationId);
    setDeletingId(conversationId);
    
    try {
      await ChatService.deleteConversation(conversationId, user!.token);
      
      // Remove from local state
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      // If deleting current conversation, start new one
      if (currentConversationId === conversationId) {
        onNewConversation();
      }
      
      toast({
        title: "Conversation Deleted",
        description: "Chat history has been removed",
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Delete Failed",
        description: "Could not delete conversation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return messageDate.toLocaleDateString();
  };

  const getConversationPreview = (conversation: Conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return 'New conversation';
    }
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    return lastMessage.text.slice(0, 50) + (lastMessage.text.length > 50 ? '...' : '');
  };

  return (
    <div className="w-80 bg-white/70 backdrop-blur-md border-r border-indigo-100 h-full overflow-y-auto">
      <div className="p-4 border-b border-indigo-100">
        <Button
          onClick={onNewConversation}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      <div className="p-4 space-y-2">
        {isLoading ? (
          <div className="text-center text-gray-500 py-8">
            Loading conversations...
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No conversations yet</p>
            <p className="text-sm">Start a new chat to begin</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <Card
              key={conversation.id}
              className={`p-3 cursor-pointer transition-colors hover:bg-indigo-50 ${
                currentConversationId === conversation.id ? 'bg-indigo-100 border-indigo-300' : 'border-gray-200'
              }`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-sm text-gray-800 line-clamp-1 flex-1 pr-2">
                    {conversation.title || 'Untitled Chat'}
                  </h3>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost" 
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-gray-200 flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[120px]">
                        <DropdownMenuItem
                          onClick={(e) => handleDeleteConversation(conversation.id, e)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                          disabled={deletingId === conversation.id}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {deletingId === conversation.id ? 'Deleting...' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {getConversationPreview(conversation)}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDate(conversation.updatedAt)}
                </p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;
