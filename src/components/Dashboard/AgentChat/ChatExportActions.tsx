
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Save, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agentId?: string;
}

interface ChatExportActionsProps {
  messages: Message[];
  agentName: string;
  onSaved?: (id: string) => void;
}

const ChatExportActions: React.FC<ChatExportActionsProps> = ({ messages, agentName, onSaved }) => {
  const [isSaving, setIsSaving] = useState(false);

  const exportToPDF = () => {
    try {
      // Create new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add title
      const title = `Chat with ${agentName}`;
      doc.setFontSize(18);
      doc.text(title, pageWidth/2, 20, { align: 'center' });
      
      // Add date
      doc.setFontSize(12);
      doc.text(`Generated: ${format(new Date(), 'PPpp')}`, pageWidth/2, 30, { align: 'center' });
      
      // Add messages
      doc.setFontSize(10);
      let yPosition = 40;
      
      messages.forEach((msg) => {
        const sender = msg.role === 'user' ? 'You' : agentName;
        const timeStr = format(new Date(msg.timestamp), 'HH:mm:ss');
        
        // Add sender and time
        doc.setFont(undefined, 'bold');
        doc.text(`${sender} (${timeStr})`, 10, yPosition);
        yPosition += 5;
        
        // Add message content with word wrap
        doc.setFont(undefined, 'normal');
        const textLines = doc.splitTextToSize(msg.content, pageWidth - 20);
        doc.text(textLines, 10, yPosition);
        
        // Adjust position for next message
        yPosition += (textLines.length * 5) + 10;
        
        // Check if we need a new page
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
      });
      
      // Save PDF
      doc.save(`chat_with_${agentName.replace(/\s+/g, '_').toLowerCase()}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`);
      
      toast({
        title: 'Export Successful',
        description: 'Chat conversation has been exported to PDF',
      });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast({
        title: 'Export Failed',
        description: 'Could not export chat conversation to PDF',
        variant: 'destructive',
      });
    }
  };

  const saveToSupabase = async () => {
    try {
      setIsSaving(true);
      
      // Get user info - for temporary use, in a real app this would come from auth
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const username = userData.username;
      
      if (!username) {
        throw new Error('You need to be logged in to save conversations');
      }
      
      if (messages.length < 2) {
        throw new Error('Need at least one exchange to save the conversation');
      }
      
      // Format conversation for storage - ensure messages are serializable
      const conversation = {
        username,
        agent_name: agentName,
        title: `Chat with ${agentName}`,
        created_at: new Date().toISOString(),
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp
        })),
      };
      
      console.log('Saving conversation:', conversation);
      
      // Use the public schema explicitly for the insert
      const { data, error } = await supabase
        .from('agent_conversations')
        .insert(conversation)
        .select();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      toast({
        title: 'Conversation Saved',
        description: 'This chat has been saved to your account',
      });
      
      if (onSaved && data && data[0]) {
        onSaved(data[0].id);
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Could not save conversation',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex space-x-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={exportToPDF}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Export PDF
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={saveToSupabase}
        disabled={isSaving}
        className="flex items-center gap-2"
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Save Chat
      </Button>
    </div>
  );
};

export default ChatExportActions;
