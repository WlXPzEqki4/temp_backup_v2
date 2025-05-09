
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Loader2, AlertCircle, RefreshCw, TrendingUp, TrendingDown, Bitcoin, CircleDollarSign } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface CryptoWidgetProps {
  coinId: string;
  name: string;
}

const CryptoWidget: React.FC<CryptoWidgetProps> = ({ coinId, name }) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['crypto', coinId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('stock-data', {
        body: { symbol: coinId, type: 'crypto' }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Card className="h-[365px]">
        <CardHeader>
          <CardTitle className="text-md font-medium">{name}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-[365px]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-md font-medium">{name}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading crypto data</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : 'Failed to fetch crypto data'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="h-[365px]">
        <CardHeader>
          <CardTitle className="text-md font-medium">{name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTitle>No data available</AlertTitle>
            <AlertDescription>Crypto data is currently unavailable</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const isPositive = data.change24h >= 0;
  const firstPrice = data.historicalData[0]?.price || data.price;
  const priceChange = data.price - firstPrice;
  const priceChangePercent = (priceChange / firstPrice) * 100;
  const Icon = coinId === 'bitcoin' ? Bitcoin : CircleDollarSign;
  const marketCap = data.price * (coinId === 'bitcoin' ? 19600000 : 120400000);
  const formattedMarketCap = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(marketCap);
  
  const formattedVolume = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(data.price * 1000000);

  return (
    <Card className="h-[425px] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5" />
          <CardTitle className="text-lg font-semibold truncate">{name}</CardTitle>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium">Market Cap</div>
            <div className="text-xs text-muted-foreground truncate">{formattedMarketCap}</div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-xl sm:text-2xl font-bold">${data.price.toLocaleString()}</div>
            <div className={`text-xs sm:text-sm ${isPositive ? 'text-green-500' : 'text-red-500'} flex items-center`}>
              {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {isPositive ? '+' : ''}{data.change24h.toFixed(2)}%
            </div>
          </div>
          <div className="flex gap-3 sm:gap-6 text-xs">
            <div className="text-right">
              <div className="text-gray-500">24h Vol</div>
              <div className="font-medium truncate">{formattedVolume}</div>
            </div>
            <div className="text-right">
              <div className="text-gray-500">Supply</div>
              <div className="font-medium">
                {coinId === 'bitcoin' ? '19.6M BTC' : '120.4M ETH'}
              </div>
            </div>
          </div>
        </div>

        <div className="h-[190px] mb-3">
          <ChartContainer 
            config={{
              "area": { color: isPositive ? "#22c55e" : "#ef4444" },
            }}
          >
            <AreaChart data={data.historicalData}>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 9 }}
                tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                tick={{ fontSize: 9 }}
                domain={['auto', 'auto']}
                tickFormatter={(value) => `$${value}`}
                width={35}
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

        <div className="grid grid-cols-2 gap-4 text-xs border-t pt-3">
          <div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span className="text-gray-500">ATH:</span>
                <span className="font-medium">
                  ${coinId === 'bitcoin' ? '69,044' : '4,865'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Dominance:</span>
                <span className="font-medium">
                  {coinId === 'bitcoin' ? '51.2%' : '17.5%'}
                </span>
              </div>
            </div>
          </div>
          <div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span className="text-gray-500">24h:</span>
                <span className={`font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{data.change24h.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Price Δ:</span>
                <span className={`font-medium ${priceChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CryptoWidget;
