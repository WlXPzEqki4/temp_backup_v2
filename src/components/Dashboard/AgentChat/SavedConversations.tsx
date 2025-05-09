
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { History, Loader2, MessageSquare, Trash2 } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';

interface SavedConversation {
  id: string;
  title: string;
  created_at: string;
  agent_name: string;
  messages: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }[];
}

interface SupabaseConversation {
  id: string;
  title: string;
  created_at: string;
  agent_name: string;
  username: string;
  messages: Json;
}

interface SavedConversationsProps {
  onLoadConversation: (agentId: string, messages: any[]) => void;
}

const SavedConversations: React.FC<SavedConversationsProps> = ({ onLoadConversation }) => {
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchSavedConversations = async () => {
    try {
      setIsLoading(true);
      
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const username = userData.username;
      
      if (!username) {
        throw new Error('You need to be logged in to view saved conversations');
      }
      
      // Explicitly add .eq and filter by the username
      const { data, error } = await supabase
        .from('agent_conversations')
        .select('*')
        .eq('username', username)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Fetched conversations:', data);
      
      // Transform the data to ensure messages are correctly typed
      const transformedData: SavedConversation[] = (data || []).map((item: SupabaseConversation) => {
        // Convert the Json type to the expected message array format
        let parsedMessages;
        try {
          // First check if it's already an array
          if (Array.isArray(item.messages)) {
            parsedMessages = item.messages;
          } else if (typeof item.messages === 'string') {
            // Try to parse if it's a string
            parsedMessages = JSON.parse(item.messages);
          } else {
            // Otherwise treat it as a Json object that needs to be cast
            parsedMessages = item.messages as unknown as Array<{
              role: 'user' | 'assistant';
              content: string;
              timestamp: string;
            }>;
          }
        } catch (e) {
          console.error('Error parsing messages:', e);
          parsedMessages = [];
        }
        
        return {
          id: item.id,
          title: item.title,
          created_at: item.created_at,
          agent_name: item.agent_name,
          messages: Array.isArray(parsedMessages) ? parsedMessages : []
        };
      });
      
      console.log('Transformed conversations:', transformedData);
      setConversations(transformedData);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: 'Failed to Load',
        description: error instanceof Error ? error.message : 'Could not load saved conversations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load conversations when dialog is opened
    if (isOpen) {
      fetchSavedConversations();
    }
  }, [isOpen]);

  const handleLoadConversation = (conversation: SavedConversation) => {
    // Find agent ID based on agent name
    import('@/utils/agents').then(module => {
      const agents = module.agents;
      const agent = agents.find(a => a.name === conversation.agent_name);
      
      if (agent) {
        console.log('Loading conversation for agent:', agent.name);
        
        // Transform messages from stored format to app format
        const transformedMessages = conversation.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          agentId: agent.id
        }));
        
        onLoadConversation(agent.id, transformedMessages);
        setIsOpen(false);
        
        toast({
          title: 'Conversation Loaded',
          description: `Loaded: ${conversation.title}`,
        });
      } else {
        toast({
          title: 'Agent Not Found',
          description: `Could not find the agent: ${conversation.agent_name}`,
          variant: 'destructive',
        });
      }
    });
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent click handler
    
    try {
      const { error } = await supabase
        .from('agent_conversations')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      setConversations(conversations.filter(c => c.id !== id));
      
      toast({
        title: 'Deleted',
        description: 'Conversation has been deleted',
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'Could not delete conversation',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <History className="h-4 w-4" />
          Load Saved
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Saved Conversations</DialogTitle>
        </DialogHeader>
        
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No saved conversations found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleLoadConversation(conversation)}
                  className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-medium">{conversation.title}</h3>
                    <p className="text-xs text-gray-500">
                      {format(new Date(conversation.created_at), 'PPp')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteConversation(conversation.id, e)}
                  >
                    <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SavedConversations;
