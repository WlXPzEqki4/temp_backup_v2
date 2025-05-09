import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, FileText, ClipboardList, Users, Share2, Mic } from 'lucide-react';
import AIChat from '@/components/Dashboard/AIChat';
import PDFChat from '@/components/Dashboard/PDFChat';
import AISummaryReport from '@/components/Dashboard/AISummaryReport';
import AIAgentDiscussion from '@/components/Dashboard/AIAgentDiscussion';
import KnowledgeGraphTab from '@/components/Dashboard/KnowledgeGraphTab';
import ConversationTab from '@/components/Dashboard/ConversationTab';

interface AITabProps {
  user?: any;
}

const AITab: React.FC<AITabProps> = ({ user }) => {
  // Enhanced function to extract user classification level from the user object and normalize it
  const extractUserClassificationLevel = (user?: any): string => {
    console.log("Raw user object:", JSON.stringify(user, null, 2));
    
    if (!user) {
      console.log("No user object provided, defaulting to 'unclassified'");
      return 'unclassified';
    }
    
    if (!user.classification_levels) {
      console.log("No classification_levels in user object, defaulting to 'unclassified'");
      return 'unclassified';
    }
    
    const classificationLevels = user.classification_levels.toLowerCase();
    console.log("Raw classification level string:", classificationLevels);
    
    // Check for top secret first (most privileged)
    if (classificationLevels.includes('top') && (classificationLevels.includes('secret') || classificationLevels.includes('_secret'))) {
      console.log("User has top secret clearance");
      return 'top_secret';
    } 
    // Then check for secret
    else if (classificationLevels.includes('secret')) {
      console.log("User has secret clearance");
      return 'secret';
    } 
    // Default to unclassified
    else {
      console.log("User has unclassified clearance or unrecognized format");
      return 'unclassified';
    }
  };
  
  const userClassificationLevel = extractUserClassificationLevel(user);
  console.log("Final extracted user classification level:", userClassificationLevel);

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
    <div className="space-y-4">
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
          <TabsTrigger value="knowledge-graph" className="gap-2" onClick={() => window.scrollTo(0, 0)}>
            <Share2 className="h-4 w-4" />
            Knowledge Graph
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
        
        <TabsContent value="knowledge-graph" className="mt-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">Knowledge Graph</h2>
                <p className="text-sm text-gray-500">
                  Interactive visualization of entities and their relationships in the intelligence network.
                </p>
              </div>
            </div>
            <KnowledgeGraphTab userClassificationLevel={userClassificationLevel} />
          </div>
        </TabsContent>
        
        <TabsContent value="conversation" className="mt-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">Voice Conversation</h2>
                <p className="text-sm text-gray-500">
                  Have a natural voice conversation with an AI assistant powered by ElevenLabs.
                </p>
              </div>
            </div>
            <ConversationTab userClassificationLevel={userClassificationLevel} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AITab;
