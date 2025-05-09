import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, AlertCircle, RefreshCw, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface StockData {
  price: number;
  historicalData: Array<{
    date: string;
    price: number;
  }>;
  notice?: string;
}

interface StockWidgetProps {
  symbol: string;
  companyName: string;
}

const generateFallbackData = (symbol: string): StockData => {
  const basePrice = symbol === 'AAPL' ? 180 : 350;
  const today = new Date();
  const historicalData = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    const randomFactor = 0.98 + Math.random() * 0.04;
    const dayPrice = i === 0 
      ? basePrice 
      : historicalData[historicalData.length - 1].price * randomFactor;
    
    historicalData.push({
      date: date.toISOString().split('T')[0],
      price: Number(dayPrice.toFixed(2))
    });
  }
  
  return {
    price: historicalData[historicalData.length - 1].price,
    historicalData
  };
};

const StockWidget: React.FC<StockWidgetProps> = ({ symbol, companyName }) => {
  const fetchStockData = async (): Promise<StockData> => {
    try {
      console.log(`Fetching stock data for ${symbol}...`);
      
      const { data, error } = await supabase.functions.invoke('stock-data', {
        body: { symbol }
      });
      
      if (error) {
        console.error(`Error fetching stock data for ${symbol}:`, error);
        throw new Error(`Failed to fetch stock data: ${error.message}`);
      }
      
      if (!data) {
        console.error('No data returned from API');
        throw new Error('No stock data available');
      }
      
      if (data.error) {
        console.error('API returned an error:', data.error);
        
        if (data.error === "FINNHUB_API_KEY not configured") {
          throw new Error("API key not configured");
        }
        
        if (data.errorCode === 'FINNHUB_ACCESS_DENIED') {
          throw new Error("API access denied: You don't have access to this resource with your current plan");
        }
        
        throw new Error(data.error);
      }
      
      // Ensure the data has the expected structure
      if (!data.price || !data.historicalData || !Array.isArray(data.historicalData)) {
        console.error('Invalid data structure received:', data);
        throw new Error('Invalid data format received from API');
      }
      
      return data;
    } catch (error) {
      console.error(`Error fetching stock data for ${symbol}:`, error);
      throw error;
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['stock', symbol],
    queryFn: fetchStockData,
    refetchInterval: 5 * 60 * 1000,
    retry: 1, // Only retry once to avoid hammering the API
    retryDelay: 2000, // Wait 2 seconds before retrying
  });

  const handleRefresh = () => {
    toast({
      title: 'Refreshing stock data',
      description: `Fetching latest data for ${companyName}...`,
    });
    refetch();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-md font-medium">{companyName} ({symbol})</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error && error instanceof Error && error.message === "API key not configured") {
    const fallbackData = generateFallbackData(symbol);
    
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-md font-medium">{companyName} ({symbol})</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 border-amber-300 bg-amber-50 text-amber-800">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertTitle>API Key Required</AlertTitle>
            <AlertDescription>
              The Finnhub API key is not configured. Please add the FINNHUB_API_KEY secret in your Supabase project. Showing demo data for now.
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col mb-4">
            <div className="text-2xl font-bold">${fallbackData.price.toFixed(2)}</div>
            <div className="text-sm text-gray-500">
              (Demo data - API key not configured)
            </div>
          </div>
          <div className="h-[200px]">
            <ChartContainer 
              config={{
                "area": { color: "#22c55e" },
              }}
            >
              <AreaChart data={fallbackData.historicalData}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={`var(--color-area)`}
                  fill={`var(--color-area)`}
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error && error instanceof Error && error.message.includes("API access denied")) {
    const fallbackData = generateFallbackData(symbol);
    
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-md font-medium">{companyName} ({symbol})</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 border-amber-300 bg-amber-50 text-amber-800">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertTitle>API Access Restricted</AlertTitle>
            <AlertDescription>
              The Finnhub API returned a 403 error. This could be because:
              <ul className="list-disc ml-5 mt-2">
                <li>Your API key doesn't have access to this data</li>
                <li>You're trying to access premium features with a free plan</li>
                <li>You've reached your API call limit</li>
                <li>This symbol might be restricted on your plan</li>
              </ul>
              Showing demo data for now.
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col mb-4">
            <div className="text-2xl font-bold">${fallbackData.price.toFixed(2)}</div>
            <div className="text-sm text-gray-500">
              (Demo data - API access restricted)
            </div>
          </div>
          <div className="h-[200px]">
            <ChartContainer 
              config={{
                "area": { color: "#22c55e" },
              }}
            >
              <AreaChart data={fallbackData.historicalData}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={`var(--color-area)`}
                  fill={`var(--color-area)`}
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data?.notice) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-md font-medium">{companyName} ({symbol})</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 border-amber-300 bg-amber-50 text-amber-800">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertTitle>Partial Data Available</AlertTitle>
            <AlertDescription>
              {data.notice} - Current price is real-time data.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col mb-4">
            <div className="text-2xl font-bold">${data.price.toFixed(2)}</div>
            <div className="text-sm text-gray-500">
              Current price (historical data is simulated)
            </div>
          </div>
          <div className="h-[200px]">
            <ChartContainer 
              config={{
                "area": { color: "#22c55e" },
              }}
            >
              <AreaChart data={data.historicalData}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={`var(--color-area)`}
                  fill={`var(--color-area)`}
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-md font-medium">{companyName} ({symbol})</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading stock data</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : 'Unable to load stock data'}
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-sm text-gray-500">
            Try refreshing or come back later.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-md font-medium">{companyName} ({symbol})</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTitle>No data available</AlertTitle>
            <AlertDescription>Stock data is currently unavailable</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const firstPrice = data.historicalData[0]?.price || data.price;
  const priceChange = data.price - firstPrice;
  const priceChangePercent = (priceChange / firstPrice) * 100;
  const isPositive = priceChange >= 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-md font-medium">
          {companyName} ({symbol})
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col mb-4">
          <div className="text-2xl font-bold">${data.price.toFixed(2)}</div>
          <div className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
          </div>
        </div>
        <div className="h-[200px]">
          <ChartContainer 
            config={{
              "area": { color: isPositive ? "#22c55e" : "#ef4444" },
            }}
          >
            <AreaChart data={data.historicalData}>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                domain={['auto', 'auto']}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={`var(--color-area)`}
                fill={`var(--color-area)`}
                fillOpacity={0.1}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockWidget;
