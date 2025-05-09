
import React, { useState, useRef, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, MessageSquare, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const AIChat: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        role: 'ai',
        content: 'Hello! I\'m your AI assistant. I can help you analyze and answer questions about the data feeds available at your security classification level. What would you like to know?',
        timestamp: new Date()
      }
    ]);
  }, []);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: message,
      timestamp: new Date()
    }]);
    
    const userQuery = message;
    setMessage(''); // Clear input
    setIsLoading(true);
    
    try {
      // Get the user's data from localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const username = userData.username || '';
      
      if (!username) {
        throw new Error('User is not logged in');
      }
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          query: userQuery,
          username: username
        }
      });
      
      if (error) {
        throw new Error(`Error calling AI service: ${error.message}`);
      }
      
      setMessages(prev => [...prev, {
        role: 'ai',
        content: data.response,
        timestamp: new Date()
      }]);
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        role: 'ai',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again later or contact support if the problem persists.`,
        timestamp: new Date()
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

  const renderMessage = (msg: Message, index: number) => {
    const isAI = msg.role === 'ai';
    
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
              <Bot className="h-5 w-5 mr-2" />
            ) : (
              <MessageSquare className="h-5 w-5 mr-2" />
            )}
            <span className="font-semibold">
              {isAI ? 'AI Assistant' : 'You'}
            </span>
          </div>
          <p className="whitespace-pre-wrap">{msg.content}</p>
          <div className="text-xs opacity-70 mt-2">
            {msg.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-240px)]">
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 rounded-md mb-4">
        {messages.map((msg, index) => renderMessage(msg, index))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <div className="flex items-center">
                <Bot className="h-5 w-5 mr-2" />
                <span className="font-semibold">AI Assistant</span>
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
          placeholder="Ask me about information in your data feeds..."
          className="flex-1 min-h-[80px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isLoading}
        />
        <Button 
          onClick={handleSendMessage}
          disabled={isLoading || !message.trim()}
          className="self-end"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
};

export default AIChat;
