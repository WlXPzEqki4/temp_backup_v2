import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format, parse } from "date-fns";
import { CalendarIcon, RefreshCw, FileText, Loader2, Newspaper, Save, Volume2, VolumeX } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import SavedSummaries from './SavedSummaries';

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

interface DateRecord {
  date: string;
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

// Define available voices
const ELEVEN_LABS_VOICES = [
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella' },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi' },
  { id: '29vD33N1CtxCmqQRPOHJ', name: 'Adam' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Antoni' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh' },
];

const AISummaryReport: React.FC = () => {
  const [uniqueDates, setUniqueDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<NewsSummary | null>(null);
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date());
  const [isLoadingDates, setIsLoadingDates] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(ELEVEN_LABS_VOICES[0].id);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<boolean>(false);
  const [audioSection, setAudioSection] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [savedSummaryId, setSavedSummaryId] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  
  // Function to fetch unique dates from the news_angola table
  useEffect(() => {
    async function fetchUniqueDates() {
      setIsLoadingDates(true);
      try {
        // Call the no-parameter version of the RPC function
        const { data, error } = await supabase.rpc('get_user_summary_dates');
        
        if (error) {
          console.error('Error fetching unique dates:', error);
          throw error;
        }
        
        if (data && Array.isArray(data) && data.length > 0) {
          // Data is already in the correct format
          const uniqueDatesArray = data.map(item => item.date);
          console.log("Fetched dates:", uniqueDatesArray);
          setUniqueDates(uniqueDatesArray);
          
          // Default to most recent date
          if (uniqueDatesArray.length > 0) {
            setSelectedDate(uniqueDatesArray[0]);
            // Update calendar with most recent date
            setCalendarDate(parse(uniqueDatesArray[0].substring(0, 10), 'yyyy-MM-dd', new Date()));
          }
        } else {
          console.log('No dates found in database or unexpected data format:', data);
          setUniqueDates([]);
        }
      } catch (error) {
        console.error('Error fetching unique dates:', error);
        toast({
          title: "Error",
          description: "Failed to fetch available dates.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingDates(false);
      }
    }
    
    fetchUniqueDates();
  }, []);
  
  // Update selected date when calendar date changes
  useEffect(() => {
    if (calendarDate) {
      const formattedDate = format(calendarDate, "yyyy-MM-dd");
      // Find the closest matching date in our unique dates
      const matchingDate = uniqueDates.find(date => date.startsWith(formattedDate));
      if (matchingDate) {
        setSelectedDate(matchingDate);
      }
    }
  }, [calendarDate, uniqueDates]);
  
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    // Update calendar date to match
    const parsedDate = parse(date.substring(0, 10), 'yyyy-MM-dd', new Date());
    setCalendarDate(parsedDate);
    setSummary(null); // Clear previous summary
    setAudioSrc(null); // Clear previous audio
    setSavedSummaryId(null); // Clear saved summary ID
  };
  
  const generateSummary = async () => {
    if (!selectedDate) {
      toast({
        title: "Please select a date",
        description: "A date is required to generate a summary report",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    setSummary(null);
    setAudioSrc(null);
    setSavedSummaryId(null);
    
    try {
      // Call the news-summary edge function
      const { data, error } = await supabase.functions.invoke('news-summary', {
        body: { date: selectedDate }
      });
      
      if (error) throw error;
      
      setSummary(data);
      
      toast({
        title: "Summary Generated",
        description: `News summary for ${format(parse(selectedDate.substring(0, 10), 'yyyy-MM-dd', new Date()), 'MMMM d, yyyy')} is ready.`,
      });
    } catch (error) {
      console.error('Error generating summary:', error);
      
      toast({
        title: 'Error',
        description: 'Failed to generate the summary. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveSummary = async () => {
    if (!summary) {
      toast({
        title: "No summary to save",
        description: "Generate a summary first before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Get user info from localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const username = userData.username;
      
      if (!username) {
        throw new Error('You need to be logged in to save summaries');
      }

      // Prepare the summary data for storage
      const summaryData = {
        username,
        date: selectedDate,
        summary_data: JSON.stringify(summary), // Convert to JSON string for storage
        voice_id: audioSrc ? selectedVoice : null,
        audio_data: audioSrc ? JSON.stringify({
          audio_base64: audioSrc.split(',')[1], // Extract base64 data part
          format: 'mp3'
        }) : null
      };

      // Insert into news_summaries table
      const { data, error } = await supabase
        .from('news_summaries')
        .insert(summaryData)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (data && data.length > 0) {
        setSavedSummaryId(data[0].id);
      }

      toast({
        title: "Summary Saved",
        description: "Your summary has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving summary:', error);
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Could not save summary',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const generateAudio = async (section: string) => {
    if (!summary) {
      toast({
        title: "No summary",
        description: "Generate a summary first before generating audio.",
        variant: "destructive",
      });
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Reset audio position
      setIsAudioPlaying(false);
    }
    
    // If we're clicking on the currently playing section, just stop playback
    if (isAudioPlaying && audioSection === section) {
      setAudioSection(null);
      return;
    }

    setIsGeneratingAudio(true);
    setAudioSection(section);

    try {
      let textToSpeak = '';
      
      // Get the text based on the selected section
      switch (section) {
        case 'summary':
          textToSpeak = summary.summary;
          break;
        case 'entities':
          textToSpeak = `Key entities in this summary: ${summary.entities.join(', ')}`;
          break;
        case 'themes':
          textToSpeak = `Key themes in this summary: ${summary.themes.join(', ')}`;
          break;
        default:
          textToSpeak = summary.summary;
      }

      // Call the ElevenLabs TTS edge function
      const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
        body: { 
          text: textToSpeak,
          voice_id: selectedVoice
        }
      });

      if (error) throw error;

      if (data.audio_base64) {
        // Create audio source from base64 data
        const audioSrcData = `data:audio/mp3;base64,${data.audio_base64}`;
        setAudioSrc(audioSrcData);
        
        // Play the audio
        if (audioRef.current) {
          audioRef.current.src = audioSrcData;
          audioRef.current.play()
            .then(() => {
              setIsAudioPlaying(true);
            })
            .catch(playError => {
              console.error('Error playing audio:', playError);
              toast({
                title: 'Playback Error',
                description: 'Failed to play the audio. Please try again.',
                variant: 'destructive',
              });
            });
        }
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      toast({
        title: 'Audio Generation Failed',
        description: error instanceof Error ? error.message : 'Could not generate audio',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // Reset audio position
        setIsAudioPlaying(false);
      } else {
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
        });
        setIsAudioPlaying(true);
      }
    }
  };

  const handleAudioEnded = () => {
    setIsAudioPlaying(false);
    setAudioSection(null); // Clear active section when audio finishes
  };

  const handleLoadSavedSummary = (savedSummary: SavedSummary) => {
    setSummary(savedSummary.summary_data);
    setSelectedDate(savedSummary.date);
    setSavedSummaryId(savedSummary.id);
    
    // Update calendar date
    const parsedDate = parse(savedSummary.date.substring(0, 10), 'yyyy-MM-dd', new Date());
    setCalendarDate(parsedDate);
    
    // If the summary has audio data, set it up
    if (savedSummary.audio_data?.audio_base64) {
      const format = savedSummary.audio_data.format || 'mp3';
      setAudioSrc(`data:audio/${format};base64,${savedSummary.audio_data.audio_base64}`);
      
      if (savedSummary.voice_id) {
        setSelectedVoice(savedSummary.voice_id);
      }
    } else {
      setAudioSrc(null);
    }
    
    toast({
      title: "Summary Loaded",
      description: `Loaded summary for ${format(parse(savedSummary.date.substring(0, 10), 'yyyy-MM-dd', new Date()), 'MMMM d, yyyy')}`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Form controls with aligned elements */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-6">
          <div>
            <h2 className="text-lg font-medium mb-1">Select Date</h2>
            <Select
              value={selectedDate}
              onValueChange={handleDateSelect}
              disabled={isLoadingDates || uniqueDates.length === 0}
            >
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder={isLoadingDates ? "Loading dates..." : "Select a date"} />
              </SelectTrigger>
              <SelectContent>
                {uniqueDates.map((date) => (
                  <SelectItem key={date} value={date}>
                    {format(parse(date.substring(0, 10), 'yyyy-MM-dd', new Date()), 'MMMM d, yyyy')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">Select a date to generate a summary of news articles</p>
          </div>
        </div>
        
        <div className="md:col-span-3">
          <div>
            <h2 className="text-lg font-medium mb-1">Calendar View</h2>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal h-10",
                    !calendarDate && "text-muted-foreground"
                  )}
                  disabled={isLoadingDates}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {calendarDate ? format(calendarDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={calendarDate}
                  onSelect={setCalendarDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="md:col-span-3">
          <h2 className="text-lg font-medium mb-1">Analyze</h2>
          <Button 
            onClick={generateSummary}
            disabled={isGenerating || !selectedDate}
            className="w-full h-10"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                {summary ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate
                  </>
                ) : (
                  <>
                    <Newspaper className="mr-2 h-4 w-4" />
                    Analyze News
                  </>
                )}
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Second row for saved summaries and voice selection */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6 flex space-x-2">
            <Button
              onClick={saveSummary}
              disabled={isSaving || !!savedSummaryId}
              variant={savedSummaryId ? "outline" : "default"}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {savedSummaryId ? "Summary Saved" : "Save Summary"}
            </Button>
            
            <SavedSummaries onSummaryLoad={handleLoadSavedSummary} />
          </div>
          
          <div className="md:col-span-6">
            <div className="space-y-1">
              <h2 className="text-sm font-medium">Voice Selection</h2>
              <Select
                value={selectedVoice}
                onValueChange={setSelectedVoice}
              >
                <SelectTrigger className="w-full h-8">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {ELEVEN_LABS_VOICES.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <audio 
                ref={audioRef} 
                onEnded={handleAudioEnded} 
                onPause={() => setIsAudioPlaying(false)}
                onPlay={() => setIsAudioPlaying(true)}
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Summary card */}
      {summary && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Summary section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold">News Summary</h2>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={isGeneratingAudio && audioSection === 'summary'}
                    onClick={() => {
                      if (isAudioPlaying && audioSection === 'summary') {
                        // If this section is currently playing, stop it
                        if (audioRef.current) {
                          audioRef.current.pause();
                          audioRef.current.currentTime = 0;
                          setIsAudioPlaying(false);
                          setAudioSection(null);
                        }
                      } else {
                        // Otherwise generate new audio
                        generateAudio('summary');
                      }
                    }}
                  >
                    {isGeneratingAudio && audioSection === 'summary' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isAudioPlaying && audioSection === 'summary' ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                    {isGeneratingAudio && audioSection === 'summary' 
                      ? 'Generating...' 
                      : isAudioPlaying && audioSection === 'summary'
                        ? 'Stop'
                        : 'Read Aloud'}
                  </Button>
                </div>
                <div ref={summaryRef} className="text-gray-700">
                  {summary.summary}
                </div>
              </div>
              
              {/* Key Entities section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold">Key Entities</h2>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={isGeneratingAudio && audioSection === 'entities'}
                    onClick={() => {
                      if (isAudioPlaying && audioSection === 'entities') {
                        // If this section is currently playing, stop it
                        if (audioRef.current) {
                          audioRef.current.pause();
                          audioRef.current.currentTime = 0;
                          setIsAudioPlaying(false);
                          setAudioSection(null);
                        }
                      } else {
                        // Otherwise generate new audio
                        generateAudio('entities');
                      }
                    }}
                  >
                    {isGeneratingAudio && audioSection === 'entities' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isAudioPlaying && audioSection === 'entities' ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                    {isGeneratingAudio && audioSection === 'entities' 
                      ? 'Generating...' 
                      : isAudioPlaying && audioSection === 'entities'
                        ? 'Stop'
                        : 'Read Aloud'}
                  </Button>
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  {summary.entities.map((entity, index) => (
                    <li key={index} className="text-gray-700">{entity}</li>
                  ))}
                </ul>
              </div>
              
              {/* Key Themes section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold">Key Themes</h2>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={isGeneratingAudio && audioSection === 'themes'}
                    onClick={() => {
                      if (isAudioPlaying && audioSection === 'themes') {
                        // If this section is currently playing, stop it
                        if (audioRef.current) {
                          audioRef.current.pause();
                          audioRef.current.currentTime = 0;
                          setIsAudioPlaying(false);
                          setAudioSection(null);
                        }
                      } else {
                        // Otherwise generate new audio
                        generateAudio('themes');
                      }
                    }}
                  >
                    {isGeneratingAudio && audioSection === 'themes' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isAudioPlaying && audioSection === 'themes' ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                    {isGeneratingAudio && audioSection === 'themes' 
                      ? 'Generating...' 
                      : isAudioPlaying && audioSection === 'themes'
                        ? 'Stop'
                        : 'Read Aloud'}
                  </Button>
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  {summary.themes.map((theme, index) => (
                    <li key={index} className="text-gray-700">{theme}</li>
                  ))}
                </ul>
              </div>
              
              {/* Source Articles section */}
              <div>
                <h2 className="text-xl font-semibold mb-2">Source Articles ({summary.articles.length})</h2>
                <div className="space-y-3">
                  {summary.articles.map((article, index) => (
                    <div key={index} className="border-l-2 border-indigo-500 pl-4 py-1">
                      <h3 className="font-medium">{article.title || 'Untitled'}</h3>
                      <div className="flex flex-wrap gap-x-4 text-sm text-gray-500">
                        {article.source && <span>Source: {article.source}</span>}
                        {article.author && <span>Author: {article.author}</span>}
                        {article.published_at && <span>Published: {new Date(article.published_at).toLocaleString()}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading and empty states */}
      {isLoadingDates && (
        <div className="flex items-center justify-center my-8">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mr-2" />
          <span>Loading available dates...</span>
        </div>
      )}
      
      {!isLoadingDates && uniqueDates.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No news articles available in the database.</p>
        </div>
      )}
    </div>
  );
};

export default AISummaryReport;
