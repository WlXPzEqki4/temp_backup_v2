
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Bot, FileText, MessageSquare, Loader2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const PDFChat: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // Generate a unique conversation ID when component mounts
    setConversationId(uuidv4());
  }, []);
  
  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        role: 'ai',
        content: 'Upload a PDF document to get started. I can help you analyze and answer questions about its contents.',
        timestamp: new Date()
      }
    ]);
  }, []);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check if file is a PDF
      if (selectedFile.type !== 'application/pdf') {
        toast({
          title: 'Invalid file type',
          description: 'Please select a PDF document',
          variant: 'destructive',
        });
        return;
      }
      
      // Check file size (limit to 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select a file smaller than 10MB',
          variant: 'destructive',
        });
        return;
      }
      
      setFile(selectedFile);
      setIsUploading(true);
      
      try {
        // Upload file to Supabase Storage
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('pdf_docs')
          .upload(filePath, selectedFile);
        
        if (uploadError) {
          throw new Error(uploadError.message);
        }
        
        // Get URL for the uploaded file
        const { data: urlData } = await supabase.storage
          .from('pdf_docs')
          .getPublicUrl(filePath);
        
        setFileUrl(`pdf_docs/${filePath}`);
        
        // Add file upload message
        setMessages(prev => [...prev, {
          role: 'user',
          content: `Uploaded: ${selectedFile.name}`,
          timestamp: new Date()
        }]);
        
        // Add AI response about processing the PDF
        setMessages(prev => [...prev, {
          role: 'ai',
          content: `I've processed "${selectedFile.name}". What would you like to know about this document?`,
          timestamp: new Date()
        }]);

        toast({
          title: 'File uploaded successfully',
          description: 'You can now ask questions about this document',
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        toast({
          title: 'Upload failed',
          description: error instanceof Error ? error.message : 'An unknown error occurred',
          variant: 'destructive',
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    if (!file || !fileUrl) {
      toast({
        title: 'No document uploaded',
        description: 'Please upload a PDF document first',
        variant: 'destructive',
      });
      return;
    }
    
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
      // Get user information if available
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const username = userData.username || '';
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('pdf-chat', {
        body: { 
          query: userQuery,
          fileUrl: fileUrl,
          username: username || null,
          conversationId: conversationId
        }
      });
      
      if (error) {
        throw new Error(`Error calling PDF chat service: ${error.message}`);
      }
      
      // Add AI response
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

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
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
    <div className="flex flex-col h-[calc(100vh-360px)]">
      <div className="mb-4">
        <Card className="bg-gray-50">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <input 
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="application/pdf"
            />
            <Button 
              onClick={triggerFileUpload} 
              variant="outline"
              className="w-full h-28 border-dashed flex flex-col gap-2 items-center justify-center"
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Upload className="h-6 w-6" />
              )}
              <div className="flex flex-col items-center">
                <span className="font-medium">{file ? 'Replace PDF' : 'Upload PDF'}</span>
                <span className="text-xs text-gray-500">Max size: 10MB</span>
              </div>
            </Button>
            {file && (
              <div className="mt-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                  {file.name}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
                <p>Analyzing document...</p>
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
          placeholder="Ask me about the uploaded document..."
          className="flex-1 min-h-[80px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isLoading || !file}
        />
        <Button 
          onClick={handleSendMessage}
          disabled={isLoading || !message.trim() || !file}
          className="self-end"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
};

export default PDFChat;
