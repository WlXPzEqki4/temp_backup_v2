
import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface DonutChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  colors: string[];
  title: string;
  className?: string;
  height?: number;
  showLegend?: boolean;
  legendOffset?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ 
  data, 
  dataKey, 
  nameKey, 
  colors, 
  title, 
  className = "",
  height = 300,
  showLegend = true,
  legendOffset = 15
}) => {
  // Create chart config for styling
  const chartConfig = data.reduce((acc, item, index) => {
    acc[item[nameKey] || `item-${index}`] = { 
      color: colors[index % colors.length],
      label: item[nameKey]
    };
    return acc;
  }, {} as any);
  
  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      {title && <h3 className="text-lg font-medium mb-2">{title}</h3>}
      <div className="flex-grow flex items-center justify-center">
        <ChartContainer config={chartConfig} className="w-full h-full overflow-visible">
          <ResponsiveContainer width="100%" height={height}>
            <PieChart 
              margin={{ top: 60, right: 20, bottom: 80, left: 20 }} 
              className="overflow-visible"
            >
              <Pie
                data={data}
                cx="50%"
                cy="40%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey={dataKey}
                nameKey={nameKey}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
                className="overflow-visible"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              {showLegend && (
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  formatter={(value) => <span className="text-sm text-gray-700">{value}</span>}
                  wrapperStyle={{ paddingTop: legendOffset, paddingBottom: 5 }}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

export default DonutChart;
