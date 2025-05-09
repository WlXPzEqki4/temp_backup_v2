import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import {
  Tooltip,
  Treemap,
  ResponsiveContainer
} from 'recharts';

interface NarrativesChartProps {
  date: string;
  window: string;
  className?: string;
}

// Interface for our UI component's state
interface NarrativeChartData {
  name: string;
  value: number;
  content: string;
  color: string;
}

// Interface for raw data from Supabase
interface NarrativeChartRawData {
  UUID: string | number;
  Date: string;
  Window: string | number;
  Content: string;
  Percentage: string | number;
}

const COLORS = [
  '#8B5CF6', // purple
  '#6366F1', // indigo
  '#3B82F6', // blue
  '#14B8A6', // teal
  '#10B981', // emerald
  '#84CC16', // lime
  '#EAB308', // yellow
  '#F97316', // orange
  '#EF4444', // red
  '#EC4899', // pink
  '#8B5CF6', // purple (repeat with different shades)
  '#6366F1', 
  '#3B82F6',
];

const NarrativesChart: React.FC<NarrativesChartProps> = ({ date, window, className = "" }) => {
  const [chartData, setChartData] = useState<NarrativeChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Format the percentage value for display
  const formatPercentage = (percentage: number | string): number => {
    if (typeof percentage === 'string') {
      // Remove any % sign and convert to number
      return parseFloat(percentage.replace('%', ''));
    }
    return Number(percentage);
  };

  // Transform raw data into the format needed for the treemap
  const transformData = (data: NarrativeChartRawData[]): NarrativeChartData[] => {
    if (!data || data.length === 0) {
      return [];
    }
    
    return data.map((item, index) => ({
      name: `${formatPercentage(item.Percentage)}%`,
      value: formatPercentage(item.Percentage),
      content: item.Content || '',
      color: COLORS[index % COLORS.length],
    }));
  };

  // Fetch narrative chart data from Supabase
  const fetchNarrativesChartData = async () => {
    if (!date || !window) {
      console.log("Missing date or window parameter, skipping fetch");
      setIsLoading(false);
      setChartData([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Fetching narratives chart data with params:", { date, window });
      
      // Use type assertion for the table query
      const response = await supabase
        .from('narratives_chart' as any)
        .select('*')
        .eq('Date', date)
        .eq('Window', window) as unknown as {
          data: NarrativeChartRawData[] | null,
          error: any
        };
      
      if (response.error) {
        console.error("Narratives chart fetch error:", response.error);
        throw new Error(response.error.message);
      }
      
      const data = response.data || [];
      console.log("Narratives chart data received:", data);
      
      if (Array.isArray(data) && data.length > 0) {
        // Transform and set the chart data
        const transformedData = transformData(data);
        setChartData(transformedData);
      } else {
        console.log("No narratives chart data found for the selected date and window");
        setChartData([]);
      }
    } catch (err: any) {
      console.error('Error fetching narratives chart data:', err);
      setError('Failed to load narratives chart information');
      toast({
        title: "Error loading narratives chart",
        description: err.message || 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Custom tooltip component for the treemap
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-200 max-w-sm">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-700 mt-1">{data.content}</p>
        </div>
      );
    }
    return null;
  };

  // Fix: Define the CustomTreemapContent component but don't pass it directly
  const CustomTreemapContent = (props: any) => {
    const { x, y, width, height, index } = props;
    const item = chartData[index];

    if (!item) return null;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: item.color,
            stroke: '#fff',
            strokeWidth: 2,
            cursor: 'pointer',
          }}
        />
        {width > 30 && height > 30 ? (
          <text
            x={x + width / 2}
            y={y + height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#fff"
            fontSize={14}
            fontWeight="bold"
          >
            {item.name}
          </text>
        ) : null}
      </g>
    );
  };

  // Fetch data when date or window changes
  useEffect(() => {
    if (date && window) {
      fetchNarrativesChartData();
    } else {
      setIsLoading(false);
      setChartData([]);
    }
  }, [date, window]);

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-medium">Narratives Chart</h3>
        <Card className="p-4 animate-pulse h-64 flex flex-col">
          <div className="bg-gray-200 h-6 w-32 mb-4 rounded"></div>
          <div className="flex-1 bg-gray-200 rounded"></div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-medium">Narratives Chart</h3>
        <Card className="p-4 text-red-500 bg-red-50">
          {error}
        </Card>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div>
          <h3 className="text-lg font-medium mb-1">Narratives Chart</h3>
          <p className="text-sm text-gray-500">
            Visualization of narrative distribution for the selected timeframe
          </p>
        </div>
        <Card className="p-4 text-gray-500">
          No chart data available for the selected date and window.
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-medium mb-1">Narratives Chart</h3>
        <p className="text-sm text-gray-500">
          Visualization of narrative distribution for the selected timeframe
        </p>
      </div>
      
      <Card className="p-5 shadow-sm">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={chartData}
              dataKey="value"
              stroke="#fff"
              fill="#8884d8"
              isAnimationActive={true}
              animationDuration={1000}
              content={<CustomTreemapContent />}
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default NarrativesChart;
