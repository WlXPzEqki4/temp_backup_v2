
import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface LineChartProps {
  data: any[];
  xDataKey: string;
  lines: {
    dataKey: string;
    name: string;
    color: string;
  }[];
  title: string;
  className?: string;
  height?: number;
  yAxisLabel?: string;
  hideActiveDot?: boolean;
  hideLegend?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  xDataKey, 
  lines, 
  title,
  className = "",
  height = 300,
  yAxisLabel,
  hideActiveDot = false,
  hideLegend = false
}) => {
  // Create the chart config for styling
  const chartConfig = lines.reduce((acc, line) => {
    acc[line.dataKey] = { 
      color: line.color,
      label: line.name
    };
    return acc;
  }, {} as any);

  // Format date strings if xDataKey is a date
  const formattedData = data.map(item => {
    if (item[xDataKey] && typeof item[xDataKey] === 'string' && item[xDataKey].includes('T')) {
      try {
        // Get only the date part before 'T'
        const datePart = item[xDataKey].split('T')[0];
        return {
          ...item,
          [xDataKey]: datePart,
          originalDate: item[xDataKey]  // Keep original date for reference if needed
        };
      } catch (e) {
        return item;
      }
    }
    return item;
  });

  return (
    <div className={`w-full ${className}`}>
      {title && <h3 className="text-lg font-medium mb-4">{title}</h3>}
      <div style={{ height: `${height}px` }} className="w-full">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey={xDataKey} 
                tick={{ fontSize: 12, fill: "#888" }}
                tickLine={false}
                axisLine={{ stroke: "#eee" }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: "#888" }}
                tickLine={false}
                axisLine={{ stroke: "#eee" }}
                label={yAxisLabel ? {
                  value: yAxisLabel,
                  angle: -90,
                  position: 'left',
                  style: { textAnchor: 'middle', fill: '#888', fontSize: 12 }
                } : undefined}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              {!hideLegend && (
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-sm text-gray-700">{value}</span>}
                />
              )}
              {lines.map((line, index) => (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={line.dataKey}
                  name={line.name}
                  stroke={line.color}
                  activeDot={hideActiveDot ? false : { r: 6, fill: line.color, stroke: "#fff" }}
                  strokeWidth={2}
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

export default LineChart;
