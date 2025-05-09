import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, CloudRain, Sun, Wind, Droplet, Sunrise, RefreshCw, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { formatInTimeZone } from 'date-fns-tz';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

interface WeatherData {
  current: {
    temp_c: number;
    humidity: number;
    condition: {
      text: string;
      code: number;
    };
    wind_kph: number;
    feelslike_c: number;
    precip_mm: number;
    uv: number;
    vis_km: number;
  };
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: {
          text: string;
          code: number;
        };
      };
      astro: {
        sunrise: string;
        sunset: string;
      };
    }>;
  };
}

interface WeatherWidgetProps {
  city: string;
}

const getWeatherIcon = (code: number) => {
  if (code === 1000) return <Sun className="w-12 h-12 text-yellow-500" />;
  if (code >= 1003 && code <= 1009) return <Cloud className="w-12 h-12 text-gray-500" />;
  if (code >= 1180 && code <= 1201) return <CloudRain className="w-12 h-12 text-blue-500" />;
  return <Cloud className="w-12 h-12 text-gray-500" />;
};

const WeatherWidget = ({ city }: WeatherWidgetProps) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const timezone = city === 'Abu Dhabi' || city === 'Dubai' ? 'Asia/Dubai' : 'UTC';

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?key=1440d344ee9f4153a2185539252404&q=${city}&days=3&aqi=no`
        );
        
        if (!response.ok) {
          throw new Error('Weather data fetch failed');
        }

        const data = await response.json();
        setWeatherData(data);
      } catch (error) {
        console.error('Error fetching weather:', error);
        toast({
          title: 'Weather Update Failed',
          description: `Could not fetch weather data for ${city}`,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, [city]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=1440d344ee9f4153a2185539252404&q=${city}&days=3&aqi=no`
      );
      
      if (!response.ok) {
        throw new Error('Weather data fetch failed');
      }

      const data = await response.json();
      setWeatherData(data);
      toast({
        title: 'Weather Updated',
        description: `Latest weather data fetched for ${city}`,
      });
    } catch (error) {
      console.error('Error fetching weather:', error);
      toast({
        title: 'Weather Update Failed',
        description: `Could not fetch weather data for ${city}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">{city}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-32">
          <p>Loading weather data...</p>
        </CardContent>
      </Card>
    );
  }

  if (!weatherData) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-semibold">{city}</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-center py-4">
            {getWeatherIcon(weatherData.current.condition.code)}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <div>
                <p className="text-2xl font-bold">{weatherData.current.temp_c}°C</p>
                <p className="text-sm text-gray-500">Feels like {weatherData.current.feelslike_c}°C</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Wind className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-lg">{weatherData.current.wind_kph} km/h</p>
                <p className="text-sm text-gray-500">Wind</p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">3-Day Forecast</p>
            <div className="grid grid-cols-3 gap-2">
              {weatherData.forecast.forecastday.map((day) => (
                <div key={day.date} className="text-center">
                  <p className="text-sm">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                  <div className="my-1">
                    {getWeatherIcon(day.day.condition.code)}
                  </div>
                  <p className="text-sm">
                    {Math.round(day.day.maxtemp_c)}° / {Math.round(day.day.mintemp_c)}°
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Droplet className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">{weatherData.current.humidity}%</p>
                <p className="text-xs text-gray-500">Humidity</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">UV Index</p>
              <p className="text-xs text-gray-500">{weatherData.current.uv}</p>
            </div>
            <div className="flex items-center space-x-2">
              <CloudRain className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">{weatherData.current.precip_mm}mm</p>
                <p className="text-xs text-gray-500">Precipitation</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Sunrise className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">{weatherData.forecast.forecastday[0].astro.sunrise}</p>
                <p className="text-xs text-gray-500">Sunrise</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex flex-col space-y-4">
              <CalendarComponent
                mode="single"
                selected={currentTime}
                className="mx-auto border rounded-lg"
                disabled
                ISOWeek
              />
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <p className="text-sm text-gray-500">
                  {formatInTimeZone(currentTime, timezone, 'EEEE, d MMMM yyyy')}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <p className="text-sm text-gray-500">
                  {formatInTimeZone(currentTime, timezone, 'HH:mm:ss')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
