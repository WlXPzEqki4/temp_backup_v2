
import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface BarChartProps {
  data: any[];
  xDataKey: string;
  bars: {
    dataKey: string;
    name: string;
    color: string;
  }[];
  title: string;
  className?: string;
  height?: number;
  layout?: 'vertical' | 'horizontal';
}

const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  xDataKey, 
  bars, 
  title,
  className = "",
  height = 500,
  layout = 'horizontal'
}) => {
  // Create the chart config for styling
  const chartConfig = bars.reduce((acc, bar) => {
    acc[bar.dataKey] = { 
      color: bar.color,
      label: bar.name
    };
    return acc;
  }, {} as any);

  // For single bar charts, use dynamic colors
  const singleBar = bars.length === 1;
  const colors = ['#9b87f5', '#8E9196', '#7E69AB', '#F97316', '#0EA5E9'];

  // Ensure we have valid data
  const validData = data?.length > 0 ? data : [{ [xDataKey]: "No data", [bars[0]?.dataKey || "Mentions"]: 0 }];

  // Calculate appropriate margins based on layout
  const calculateMargins = () => {
    if (layout === 'horizontal') {
      // For horizontal layout (vertical bars), provide space at bottom for labels
      return { top: 20, right: 30, left: 40, bottom: 60 };
    } else {
      // For vertical layout (horizontal bars), provide space at left for labels
      const maxLength = validData.reduce((max, item) => {
        const labelLength = item[xDataKey]?.toString().length || 0;
        return labelLength > max ? labelLength : max;
      }, 0);
      
      const leftMargin = Math.min(Math.max(maxLength * 6, 70), 120);
      return { top: 5, right: 30, left: leftMargin, bottom: 5 };
    }
  };

  const margins = calculateMargins();

  return (
    <div className={`bg-white w-full h-full ${className}`}>
      {title && <h3 className="text-lg font-medium mb-2">{title}</h3>}
      <div className="w-full h-full" style={{ height: height ? `${height}px` : '100%', minHeight: '400px' }}>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart 
              data={validData} 
              layout={layout}
              margin={margins}
              barSize={layout === 'horizontal' ? 40 : 15}
              barGap={5}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={layout === 'horizontal'} horizontal={true} stroke="#f0f0f0" />
              {layout === 'horizontal' ? (
                <>
                  <XAxis 
                    dataKey={xDataKey} 
                    tick={{ fontSize: 12, fill: "#888" }}
                    tickLine={false}
                    axisLine={{ stroke: "#eee" }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: "#888" }}
                    tickLine={false}
                    axisLine={{ stroke: "#eee" }}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                </>
              ) : (
                <>
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: "#888" }}
                    tickLine={false}
                    axisLine={{ stroke: "#eee" }}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <YAxis
                    dataKey={xDataKey}
                    type="category"
                    tick={{ fontSize: 12, fill: "#888" }}
                    tickLine={false}
                    axisLine={{ stroke: "#eee" }}
                    width={margins.left - 10}
                    tickFormatter={(value) => {
                      // Truncate long strings in the Y-axis labels
                      return value?.length > 20 ? `${value.substring(0, 18)}...` : value;
                    }}
                  />
                </>
              )}
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    formatter={(value, name) => [
                      value.toLocaleString(), 
                      name
                    ]}
                  />
                } 
                cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
              />
              {!singleBar && (
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-sm text-gray-700">{value}</span>}
                />
              )}
              {bars.map((bar, index) => (
                <Bar 
                  key={index} 
                  dataKey={bar.dataKey} 
                  name={bar.name}
                  fill={bar.color}
                  radius={[4, 4, 0, 0]}
                  animationDuration={500}
                >
                  {singleBar && validData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              ))}
            </RechartsBarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

export default BarChart;
