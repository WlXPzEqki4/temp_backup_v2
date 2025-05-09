
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow, parse } from "date-fns";
import { FileBox, Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface NewsSummary {
  summary: string;
  entities: string[];
  themes: string[];
  articles: {
    title: string;
    source: string;
    author: string;
    published_at: string;
  }[];
}

interface SavedSummary {
  id: string;
  date: string;
  created_at: string;
  summary_data: NewsSummary;
  voice_id: string | null;
  audio_data: {
    audio_base64?: string;
    format?: string;
  } | null;
}

interface SavedSummariesProps {
  onSummaryLoad: (summary: SavedSummary) => void;
}

const SavedSummaries: React.FC<SavedSummariesProps> = ({ onSummaryLoad }) => {
  const [summaries, setSummaries] = useState<SavedSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const fetchSavedSummaries = async () => {
    setIsLoading(true);
    
    try {
      // Get user info from localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const username = userData.username;
      
      if (!username) {
        throw new Error('You need to be logged in to view saved summaries');
      }

      // Query the news_summaries table
      const { data, error } = await supabase
        .from('news_summaries')
        .select('*')
        .eq('username', username)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Process the data to convert JSON strings back to objects
        const processedSummaries: SavedSummary[] = data.map(item => {
          return {
            ...item,
            summary_data: typeof item.summary_data === 'string' 
              ? JSON.parse(item.summary_data) 
              : item.summary_data,
            audio_data: item.audio_data && typeof item.audio_data === 'string'
              ? JSON.parse(item.audio_data)
              : item.audio_data
          };
        });
        
        setSummaries(processedSummaries);
      }
    } catch (error) {
      console.error('Error fetching saved summaries:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load saved summaries.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load saved summaries when the dialog opens
  const handleDialogOpen = (open: boolean) => {
    setIsDialogOpen(open);
    if (open) {
      fetchSavedSummaries();
    }
  };

  const handleSummarySelect = (summary: SavedSummary) => {
    onSummaryLoad(summary);
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <FileBox className="h-4 w-4" />
          Saved Summaries
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Saved Summaries</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : summaries.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">No saved summaries found.</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {summaries.map((summary) => {
                const summaryDate = parse(summary.date.substring(0, 10), 'yyyy-MM-dd', new Date());
                const timeAgo = formatDistanceToNow(new Date(summary.created_at), { addSuffix: true });
                
                return (
                  <div 
                    key={summary.id}
                    className="border rounded-md p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleSummarySelect(summary)}
                  >
                    <div className="font-medium">Summary for {summaryDate.toLocaleDateString()}</div>
                    <p className="text-sm text-gray-500 mt-1">Created {timeAgo}</p>
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                      {summary.summary_data.summary.substring(0, 150)}...
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {summary.summary_data.entities.slice(0, 3).map((entity, i) => (
                        <span key={i} className="text-xs bg-indigo-100 text-indigo-800 rounded-full px-2 py-1">
                          {entity}
                        </span>
                      ))}
                      {summary.summary_data.entities.length > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-800 rounded-full px-2 py-1">
                          +{summary.summary_data.entities.length - 3} more
                        </span>
                      )}
                    </div>
                    {summary.audio_data && (
                      <div className="mt-2 text-xs text-indigo-600">
                        <span>• Includes audio narration</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SavedSummaries;
