import React, { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import DataTable from '@/components/Dashboard/Charts/DataTable';
import PostInfoCards from '@/components/Dashboard/Charts/PostInfoCards';
import NarrativesChart from '@/components/Dashboard/Charts/NarrativesChart';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

interface NarrativesTableProps {
  className?: string;
}

// Interface for our UI component's state
interface NarrativeData {
  id: number;
  narrative: string;
  percentage: string;
  date: string;
  window: string;
}

// Type definition matching Supabase table with correct capitalization
type TopNarrativesByVirality = {
  UUID: string | number;
  Set: number;
  Date: string;
  Window: string;
  Narrative: string;
  Percentage: string;
}

const NarrativesTable: React.FC<NarrativesTableProps> = ({ className = "" }) => {
  const [narrativesData, setNarrativesData] = useState<NarrativeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableWindows, setAvailableWindows] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedWindow, setSelectedWindow] = useState<string>("");

  // Fetch unique dates and windows for dropdown filters
  const fetchFilterOptions = async () => {
    try {
      console.log("Fetching date options...");
      
      // Use type assertion to handle the table that's not in the TypeScript definitions
      const dateResponse = await supabase
        .from('top_narratives_by_virality' as any)
        .select('*') as unknown as { 
          data: TopNarrativesByVirality[] | null,
          error: any
        };
      
      if (dateResponse.error) {
        console.error("Date fetch error:", dateResponse.error);
        throw new Error(dateResponse.error.message);
      }
      
      const dateData = dateResponse.data || [];
      console.log("Date data received:", dateData);
      
      // Get unique dates
      if (Array.isArray(dateData)) {
        const datesSet = new Set<string>();
        dateData.forEach(item => {
          if (item.Date) datesSet.add(item.Date);
        });
        
        const uniqueDates = Array.from(datesSet);
        console.log("Processed unique dates:", uniqueDates);
        setAvailableDates(uniqueDates);
        
        if (uniqueDates.length > 0) {
          setSelectedDate(uniqueDates[0]);
        } else {
          setSelectedDate("");
          setIsLoading(false); // No dates available, so stop loading
        }
      } else {
        console.error("Expected array for date data but received:", typeof dateData);
        throw new Error("Invalid date data format received");
      }

      console.log("Fetching window options...");
      
      // Use the same data to extract unique windows
      if (Array.isArray(dateData)) {
        const windowsSet = new Set<string>();
        dateData.forEach(item => {
          if (item.Window) windowsSet.add(String(item.Window));
        });
        
        const uniqueWindows = Array.from(windowsSet);
        console.log("Processed unique windows:", uniqueWindows);
        setAvailableWindows(uniqueWindows);
        
        if (uniqueWindows.length > 0) {
          setSelectedWindow(uniqueWindows[0]);
        } else {
          setSelectedWindow("");
          setIsLoading(false); // No windows available, so stop loading
        }
      } else {
        console.error("Expected array for window data but received:", typeof dateData);
        throw new Error("Invalid window data format received");
      }
    } catch (err: any) {
      console.error('Error fetching filter options:', err);
      setError('Failed to load filter options');
      setIsLoading(false);
      toast({
        title: "Error loading filters",
        description: err.message || 'An unexpected error occurred',
        variant: "destructive",
      });
    }
  };

  // Fetch narratives data based on selected filters
  const fetchNarrativesData = async () => {
    if (!selectedDate || !selectedWindow) {
      console.log("Missing date or window selection, skipping fetch");
      setNarrativesData([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Fetching narratives data with params:", { 
        date: selectedDate, 
        window: selectedWindow 
      });
      
      // Use type assertion for the table query
      const response = await supabase
        .from('top_narratives_by_virality' as any)
        .select('*')
        .eq('Date', selectedDate)
        .eq('Window', selectedWindow) as unknown as {
          data: TopNarrativesByVirality[] | null,
          error: any
        };
      
      if (response.error) {
        console.error("Narratives fetch error:", response.error);
        throw new Error(response.error.message);
      }
      
      const data = response.data || [];
      console.log("Narratives data received:", data);
      
      if (Array.isArray(data)) {
        // Convert data to our UI format with lowercase properties
        // Keep the percentage as a string without conversion
        const formattedData: NarrativeData[] = data.map((item, index) => ({
          id: index + 1,
          narrative: String(item.Narrative || ''),
          percentage: String(item.Percentage || ''),  // Keep as string
          date: item.Date || '',
          window: String(item.Window || '')
        }));
        
        console.log("Formatted narratives data:", formattedData);
        setNarrativesData(formattedData);
      } else {
        console.error("Expected array for narrative data but received:", typeof data);
        setNarrativesData([]);
      }
    } catch (err: any) {
      console.error('Error fetching narratives data:', err);
      setError('Failed to load narratives data');
      toast({
        title: "Error loading narratives",
        description: err.message || 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize by fetching filter options
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    if (selectedDate && selectedWindow) {
      fetchNarrativesData();
    } else {
      setNarrativesData([]);
      setIsLoading(false);
    }
  }, [selectedDate, selectedWindow]);

  // Table columns configuration - updated to have separate columns
  const columns = [
    {
      key: 'narrative',
      header: 'Narrative',
      render: (value: string, item: NarrativeData) => {
        return (
          <div className="flex items-start">
            <span className="mr-1">{item.id}.</span>
            <span>{value}</span>
          </div>
        );
      }
    },
    {
      key: 'percentage',
      header: 'Percentage',
      render: (value: string) => {
        return <span>{value}</span>;
      }
    }
  ];

  return (
    <div className="space-y-8">
      <div className={`space-y-4 ${className}`}>
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div>
            <h3 className="text-lg font-medium mb-1">Top Narratives by Virality</h3>
            <p className="text-sm text-gray-500">Most viral narratives based on social media engagement</p>
          </div>
          <div className="flex gap-3">
            {/* Date selector with label */}
            <div className="w-40">
              <Label htmlFor="date-select" className="mb-1 block text-sm">Date</Label>
              <Select 
                value={selectedDate} 
                onValueChange={setSelectedDate}
                disabled={isLoading || availableDates.length === 0}
              >
                <SelectTrigger id="date-select" className="h-9">
                  <SelectValue placeholder="Select date" />
                </SelectTrigger>
                <SelectContent>
                  {availableDates.map(date => (
                    <SelectItem key={date} value={date}>{date}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Window selector with label */}
            <div className="w-40">
              <Label htmlFor="timeframe-select" className="mb-1 block text-sm">Timeframe Hours</Label>
              <Select 
                value={selectedWindow} 
                onValueChange={setSelectedWindow}
                disabled={isLoading || availableWindows.length === 0}
              >
                <SelectTrigger id="timeframe-select" className="h-9">
                  <SelectValue placeholder="Select window" />
                </SelectTrigger>
                <SelectContent>
                  {availableWindows.map(window => (
                    <SelectItem key={window} value={window}>{window}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Render the DataTable with narratives data */}
        {error ? (
          <div className="text-red-500 p-4 bg-red-50 rounded-md">{error}</div>
        ) : (
          <DataTable 
            data={narrativesData}
            columns={columns}
            title=""
            className="w-full"
            pageSize={15}
          />
        )}
      </div>
      
      {/* Add PostInfoCards component */}
      {selectedDate && selectedWindow && (
        <PostInfoCards 
          date={selectedDate} 
          window={selectedWindow}
          className="mt-8" 
        />
      )}
      
      {/* Add the new NarrativesChart component */}
      {selectedDate && selectedWindow && (
        <NarrativesChart
          date={selectedDate}
          window={selectedWindow}
          className="mt-8"
        />
      )}
    </div>
  );
};

export default NarrativesTable;
