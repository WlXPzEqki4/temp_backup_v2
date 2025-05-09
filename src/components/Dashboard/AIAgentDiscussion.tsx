
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, MessageSquare, Loader2 } from 'lucide-react';
import { agents } from '@/utils/agents';
import { supabase } from '@/integrations/supabase/client';
import ChatExportActions from './AgentChat/ChatExportActions';
import SavedConversations from './AgentChat/SavedConversations';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agentId?: string;
}

const AIAgentDiscussion: React.FC = () => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: 'Select a specialized AI agent to begin a discussion focused on their area of expertise.',
        timestamp: new Date()
      }
    ]);
  }, []);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadKnowledgeBase = async (knowledgeFile: string) => {
    try {
      const response = await fetch(knowledgeFile);
      if (!response.ok) {
        throw new Error(`Failed to load knowledge base: ${response.status}`);
      }
      const content = await response.text();
      setKnowledgeBase(content);
      return content;
    } catch (error) {
      console.error('Error loading knowledge base:', error);
      toast({
        title: 'Knowledge Base Error',
        description: 'Could not load the agent knowledge base',
        variant: 'destructive',
      });
      return '';
    }
  };

  const handleAgentChange = async (value: string) => {
    setSelectedAgentId(value);
    setIsLoading(true);
    
    // Get the selected agent
    const selectedAgent = agents.find(a => a.id === value);
    
    if (selectedAgent) {
      try {
        // Load the knowledge base
        const knowledgeContent = await loadKnowledgeBase(selectedAgent.knowledgeFile);
        
        // Clear previous conversation and add welcome message
        setMessages([
          {
            role: 'assistant',
            content: `Hello, I'm your ${selectedAgent.name}. My expertise is in ${selectedAgent.expertise}. How can I assist you today?`,
            timestamp: new Date(),
            agentId: value
          }
        ]);
      } catch (error) {
        console.error('Error during agent change:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize the AI agent',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    if (!selectedAgentId) {
      toast({
        title: 'No agent selected',
        description: 'Please select an AI agent first',
        variant: 'destructive',
      });
      return;
    }
    
    // Add user message to the conversation
    const newUserMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    
    const userQuery = message;
    setMessage(''); // Clear input
    setIsLoading(true);
    
    try {
      const selectedAgent = agents.find(a => a.id === selectedAgentId);
      
      if (!selectedAgent) {
        throw new Error('Selected agent not found');
      }
      
      // Ensure knowledge base is loaded
      let knowledgeContent = knowledgeBase;
      if (!knowledgeContent) {
        knowledgeContent = await loadKnowledgeBase(selectedAgent.knowledgeFile);
      }
      
      // Convert messages to the format expected by the API
      const apiMessages = messages
        .filter(msg => msg.agentId === selectedAgentId || !msg.agentId) // Only include messages from the current agent
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      
      // Add the new user message to the API messages
      apiMessages.push({
        role: 'user',
        content: userQuery
      });
      
      // Call the edge function with conversation history
      const { data, error } = await supabase.functions.invoke('ai-agent-chat', {
        body: { 
          systemPrompt: selectedAgent.systemPrompt,
          knowledgeContent: knowledgeContent,
          messages: apiMessages
        }
      });
      
      if (error) {
        throw new Error(`Error calling AI service: ${error.message}`);
      }
      
      // Add AI response to the conversation
      const aiResponseMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        agentId: selectedAgentId
      };
      
      setMessages(prev => [...prev, aiResponseMessage]);
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again later or contact support if the problem persists.`,
        timestamp: new Date(),
        agentId: selectedAgentId
      }]);
      
      toast({
        title: 'Error',
        description: 'Failed to get a response from the AI. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedConversation = (agentId: string, savedMessages: Message[]) => {
    setSelectedAgentId(agentId);
    setMessages(savedMessages);
    
    // Load the knowledge base for the selected agent
    const selectedAgent = agents.find(a => a.id === agentId);
    if (selectedAgent) {
      loadKnowledgeBase(selectedAgent.knowledgeFile);
    }
  };

  const handleSavedConversation = (id: string) => {
    console.log('Conversation saved with ID:', id);
    toast({
      title: 'Conversation Saved',
      description: 'You can access this chat later from the Load Saved button',
    });
  };

  const renderMessage = (msg: Message, index: number) => {
    const isAI = msg.role === 'assistant';
    const agent = isAI && msg.agentId ? agents.find(a => a.id === msg.agentId) : null;
    
    return (
      <div
        key={index}
        className={`mb-4 flex ${isAI ? 'justify-start' : 'justify-end'}`}
      >
        <div
          className={`max-w-3/4 p-4 rounded-lg ${
            isAI
              ? 'bg-white border border-gray-200'
              : 'bg-indigo-600 text-white'
          }`}
        >
          <div className="flex items-center mb-2">
            {isAI ? (
              <>
                <span className="mr-2 text-xl">{agent?.avatar || '🤖'}</span>
                <span className="font-semibold">
                  {agent?.name || 'AI Assistant'}
                </span>
              </>
            ) : (
              <>
                <MessageSquare className="h-5 w-5 mr-2" />
                <span className="font-semibold">You</span>
              </>
            )}
          </div>
          <p className="whitespace-pre-wrap">{msg.content}</p>
          <div className="text-xs opacity-70 mt-2">
            {msg.timestamp instanceof Date 
              ? msg.timestamp.toLocaleTimeString() 
              : new Date(msg.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  };

  // Get the current agent name for export purposes
  const currentAgent = agents.find(a => a.id === selectedAgentId);
  const agentName = currentAgent?.name || 'AI Assistant';

  return (
    <div className="flex flex-col h-[calc(100vh-360px)]">
      <div className="mb-4 flex justify-between items-center">
        <div className="w-2/3">
          <label className="block text-sm font-medium mb-2">Select AI Agent</label>
          <Select value={selectedAgentId} onValueChange={handleAgentChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an AI agent to discuss with" />
            </SelectTrigger>
            <SelectContent>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  <div className="flex items-center">
                    <span className="mr-2 text-xl">{agent.avatar}</span>
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-xs text-gray-500">{agent.expertise}</p>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex space-x-2">
          <SavedConversations onLoadConversation={loadSavedConversation} />
          
          {messages.length > 1 && selectedAgentId && (
            <ChatExportActions 
              messages={messages} 
              agentName={agentName}
              onSaved={handleSavedConversation}
            />
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 rounded-md mb-4">
        {messages.map((msg, index) => renderMessage(msg, index))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <div className="flex items-center">
                {selectedAgentId && (
                  <span className="mr-2 text-xl">
                    {agents.find(a => a.id === selectedAgentId)?.avatar || '🤖'}
                  </span>
                )}
                <span className="font-semibold">
                  {selectedAgentId
                    ? agents.find(a => a.id === selectedAgentId)?.name
                    : 'AI Assistant'}
                </span>
              </div>
              <div className="flex items-center mt-2">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <p>Thinking...</p>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={selectedAgentId ? "Ask something related to this agent's expertise..." : "Select an agent first..."}
          className="flex-1 min-h-[80px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isLoading || !selectedAgentId}
        />
        <Button 
          onClick={handleSendMessage}
          disabled={isLoading || !message.trim() || !selectedAgentId}
          className="self-end"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
};

export default AIAgentDiscussion;
