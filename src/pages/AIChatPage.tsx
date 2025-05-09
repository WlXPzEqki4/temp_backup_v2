
import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, FileText, ClipboardList, Users, Mic } from 'lucide-react';
import AIChat from '@/components/Dashboard/AIChat';
import PDFChat from '@/components/Dashboard/PDFChat';
import AISummaryReport from '@/components/Dashboard/AISummaryReport';
import AIAgentDiscussion from '@/components/Dashboard/AIAgentDiscussion';
import ConversationTab from '@/components/Dashboard/ConversationTab';
import { Navigate } from 'react-router-dom';

const AIChatPage: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!user.username) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Enhanced function to extract user classification level from the user object
  const extractUserClassificationLevel = (user?: any): string => {
    if (!user || !user.classification_levels) {
      return 'unclassified';
    }
    
    const classificationLevels = user.classification_levels.toLowerCase();
    
    if (classificationLevels.includes('top') && classificationLevels.includes('secret')) {
      return 'top_secret';
    } else if (classificationLevels.includes('secret')) {
      return 'secret';
    } else {
      return 'unclassified';
    }
  };
  
  const userClassificationLevel = extractUserClassificationLevel(user);

  // Enhanced function to handle tab changes without scrolling
  const handleTabChange = (value: string) => {
    // Immediately prevent any scrolling
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
    
    // Also apply after a short timeout to catch delayed scrolling
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'instant'
      });
    }, 10);
  };
  
  // Add an effect to maintain scroll position
  useEffect(() => {
    const maintainScrollPosition = () => {
      window.scrollTo(0, 0);
    };
    
    // Run on mount
    maintainScrollPosition();
    
    // Return cleanup function
    return () => {};
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">AI Assistant</h1>
      
      <Tabs defaultValue="knowledgebase" className="w-full" onValueChange={handleTabChange}>
        <TabsList className="mb-4 w-full justify-start">
          <TabsTrigger value="knowledgebase" className="gap-2" onClick={() => window.scrollTo(0, 0)}>
            <MessageSquare className="h-4 w-4" />
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="pdf" className="gap-2" onClick={() => window.scrollTo(0, 0)}>
            <FileText className="h-4 w-4" />
            PDF Analysis
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-2" onClick={() => window.scrollTo(0, 0)}>
            <ClipboardList className="h-4 w-4" />
            Daily Summary
          </TabsTrigger>
          <TabsTrigger value="agents" className="gap-2" onClick={() => window.scrollTo(0, 0)}>
            <Users className="h-4 w-4" />
            AI Agents
          </TabsTrigger>
          <TabsTrigger value="conversation" className="gap-2" onClick={() => window.scrollTo(0, 0)}>
            <Mic className="h-4 w-4" />
            Conversation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="knowledgebase" className="mt-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Knowledge Base Assistant</h2>
            <p className="text-sm text-gray-500 mb-6">
              Chat with our AI assistant that has access to information matching your clearance level.
            </p>
            <AIChat />
          </div>
        </TabsContent>

        <TabsContent value="pdf" className="mt-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">PDF Analysis</h2>
            <p className="text-sm text-gray-500 mb-6">
              Upload PDF documents and chat with an AI assistant about their contents.
            </p>
            <PDFChat />
          </div>
        </TabsContent>

        <TabsContent value="summary" className="mt-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Daily Intelligence Summary</h2>
            <p className="text-sm text-gray-500 mb-6">
              Generate concise AI-powered summaries based on recent intelligence data.
            </p>
            <AISummaryReport />
          </div>
        </TabsContent>

        <TabsContent value="agents" className="mt-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Specialized AI Agents</h2>
            <p className="text-sm text-gray-500 mb-6">
              Select and chat with AI agents specialized in different domains such as strategic communications or geopolitics.
            </p>
            <AIAgentDiscussion />
          </div>
        </TabsContent>
        
        <TabsContent value="conversation" className="mt-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Voice Conversation</h2>
            <p className="text-sm text-gray-500 mb-6">
              Have a natural voice conversation with an AI assistant powered by ElevenLabs.
            </p>
            <ConversationTab userClassificationLevel={userClassificationLevel} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIChatPage;
