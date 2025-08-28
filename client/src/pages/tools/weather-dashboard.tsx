import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime: string;
  };
  current: {
    last_updated: string;
    temp_c: number;
    temp_f: number;
    is_day: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_mph: number;
    wind_kph: number;
    wind_degree: number;
    wind_dir: string;
    pressure_mb: number;
    pressure_in: number;
    precip_mm: number;
    precip_in: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    uv: number;
  };
  forecast?: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        maxtemp_f: number;
        mintemp_c: number;
        mintemp_f: number;
        avgtemp_c: number;
        avgtemp_f: number;
        condition: {
          text: string;
          icon: string;
        };
        maxwind_mph: number;
        maxwind_kph: number;
        totalprecip_mm: number;
        totalprecip_in: number;
        avghumidity: number;
        daily_will_it_rain: number;
        daily_chance_of_rain: number;
        uv: number;
      };
    }>;
  };
}

export default function WeatherDashboard() {
  const [location, setLocation] = useState("");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMetric, setIsMetric] = useState(true);
  const [currentTime, setCurrentTime] = useState<string>("");
  const { toast } = useToast();

  // Update current time every second
  useEffect(() => {
    const updateTime = () => {
      if (weatherData?.location?.tz_id) {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: weatherData.location.tz_id 
        });
        setCurrentTime(timeString);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [weatherData]);

  // Get user's location on component mount
  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
          console.log("Geolocation error:", error);
          // Fallback to IP-based location
          fetchWeatherByLocation("auto:ip");
        }
      );
    } else {
      fetchWeatherByLocation("auto:ip");
    }
  };

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    await fetchWeather(`${lat},${lon}`);
  };

  const fetchWeatherByLocation = async (query: string) => {
    await fetchWeather(query);
  };

  const fetchWeather = async (query: string) => {
    setLoading(true);
    
    try {
      // Using WeatherAPI.com - you'll need an API key
      const API_KEY = process.env.REACT_APP_WEATHER_API_KEY || import.meta.env.VITE_WEATHER_API_KEY || "your-weather-api-key";
      
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(query)}&days=5&aqi=yes&alerts=yes`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data: WeatherData = await response.json();
      setWeatherData(data);
      
      toast({
        title: "Weather Updated",
        description: `Weather data for ${data.location.name} loaded successfully.`,
      });
    } catch (error) {
      console.error("Weather fetch error:", error);
      
      // Fallback to mock data for demo purposes
      const mockData: WeatherData = {
        location: {
          name: query === "auto:ip" ? "Demo City" : query.toString(),
          region: "Demo Region",
          country: "Demo Country",
          lat: 0,
          lon: 0,
          tz_id: "UTC",
          localtime: new Date().toISOString().slice(0, 16).replace('T', ' ')
        },
        current: {
          last_updated: new Date().toISOString().slice(0, 16).replace('T', ' '),
          temp_c: 22,
          temp_f: 72,
          is_day: 1,
          condition: {
            text: "Partly Cloudy",
            icon: "//cdn.weatherapi.com/weather/64x64/day/116.png",
            code: 1003
          },
          wind_mph: 7.2,
          wind_kph: 11.5,
          wind_degree: 210,
          wind_dir: "SW",
          pressure_mb: 1013.0,
          pressure_in: 29.92,
          precip_mm: 0.0,
          precip_in: 0.0,
          humidity: 65,
          cloud: 25,
          feelslike_c: 24,
          feelslike_f: 75,
          uv: 6
        }
      };
      
      setWeatherData(mockData);
      
      toast({
        title: "Demo Mode",
        description: "Showing demo weather data. Add your WeatherAPI key for live data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      toast({
        title: "Error",
        description: "Please enter a location.",
        variant: "destructive",
      });
      return;
    }
    
    fetchWeatherByLocation(location);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getWindDirection = (degree: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degree / 22.5) % 16];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Weather Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Get current weather and forecasts for any location</p>
        </div>

        {/* Location Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleLocationSubmit} className="flex space-x-4">
              <div className="flex-1">
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter city name, coordinates, or IP address..."
                  data-testid="location-input"
                />
              </div>
              <Button type="submit" disabled={loading} data-testid="search-weather">
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Loading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-search mr-2"></i>
                    Search
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsMetric(!isMetric)}
                data-testid="toggle-units"
              >
                {isMetric ? "°C" : "°F"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {weatherData && (
          <div className="space-y-8">
            {/* Current Weather */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <span data-testid="location-name">{weatherData.location.name}</span>
                    {weatherData.location.region && (
                      <span className="text-gray-500 dark:text-gray-400 ml-2">
                        {weatherData.location.region}, {weatherData.location.country}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400" data-testid="current-time">
                    {currentTime}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Main Weather */}
                  <div className="text-center">
                    <img 
                      src={`https:${weatherData.current.condition.icon}`} 
                      alt={weatherData.current.condition.text}
                      className="w-16 h-16 mx-auto mb-2"
                      data-testid="weather-icon"
                    />
                    <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2" data-testid="current-temp">
                      {isMetric ? `${weatherData.current.temp_c}°C` : `${weatherData.current.temp_f}°F`}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400" data-testid="weather-condition">
                      {weatherData.current.condition.text}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-500 mt-1" data-testid="feels-like">
                      Feels like {isMetric ? `${weatherData.current.feelslike_c}°C` : `${weatherData.current.feelslike_f}°F`}
                    </div>
                  </div>

                  {/* Weather Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Wind</span>
                      <span className="font-semibold" data-testid="wind-info">
                        {isMetric ? `${weatherData.current.wind_kph} km/h` : `${weatherData.current.wind_mph} mph`} {weatherData.current.wind_dir}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Humidity</span>
                      <span className="font-semibold" data-testid="humidity">{weatherData.current.humidity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Pressure</span>
                      <span className="font-semibold" data-testid="pressure">
                        {isMetric ? `${weatherData.current.pressure_mb} mb` : `${weatherData.current.pressure_in} in`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">UV Index</span>
                      <span className="font-semibold" data-testid="uv-index">{weatherData.current.uv}</span>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Cloud Cover</span>
                      <span className="font-semibold" data-testid="cloud-cover">{weatherData.current.cloud}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Precipitation</span>
                      <span className="font-semibold" data-testid="precipitation">
                        {isMetric ? `${weatherData.current.precip_mm} mm` : `${weatherData.current.precip_in} in`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Coordinates</span>
                      <span className="font-semibold text-xs" data-testid="coordinates">
                        {weatherData.location.lat.toFixed(2)}, {weatherData.location.lon.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
                      <span className="font-semibold text-xs" data-testid="last-updated">
                        {new Date(weatherData.current.last_updated).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 5-Day Forecast */}
            {weatherData.forecast && (
              <Card>
                <CardHeader>
                  <CardTitle>5-Day Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {weatherData.forecast.forecastday.map((day, index) => (
                      <div 
                        key={day.date}
                        className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        data-testid={`forecast-day-${index}`}
                      >
                        <div className="font-semibold text-gray-900 dark:text-white mb-2">
                          {index === 0 ? 'Today' : formatDate(day.date)}
                        </div>
                        <img 
                          src={`https:${day.day.condition.icon}`}
                          alt={day.day.condition.text}
                          className="w-12 h-12 mx-auto mb-2"
                        />
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {day.day.condition.text}
                        </div>
                        <div className="space-y-1">
                          <div className="font-semibold">
                            {isMetric ? `${Math.round(day.day.maxtemp_c)}°` : `${Math.round(day.day.maxtemp_f)}°`}
                          </div>
                          <div className="text-gray-500 text-sm">
                            {isMetric ? `${Math.round(day.day.mintemp_c)}°` : `${Math.round(day.day.mintemp_f)}°`}
                          </div>
                          <div className="text-xs text-blue-600 dark:text-blue-400">
                            {day.day.daily_chance_of_rain}% rain
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Weather Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Weather Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                      <i className="fas fa-thermometer-half mr-2"></i>Temperature
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      {weatherData.current.temp_c > 25 ? 
                        "It's quite warm today. Consider light clothing and stay hydrated." :
                        weatherData.current.temp_c < 5 ?
                        "It's cold outside. Bundle up and dress warmly." :
                        "Pleasant temperature today. Perfect for outdoor activities."
                      }
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">
                      <i className="fas fa-eye mr-2"></i>UV Index
                    </h4>
                    <p className="text-sm text-green-800 dark:text-green-300">
                      {weatherData.current.uv < 3 ? "Low UV. Minimal protection needed." :
                       weatherData.current.uv < 6 ? "Moderate UV. Consider sunscreen." :
                       weatherData.current.uv < 8 ? "High UV. Sunscreen and shade recommended." :
                       "Very high UV. Avoid midday sun and use strong protection."
                      }
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">
                      <i className="fas fa-wind mr-2"></i>Wind Conditions
                    </h4>
                    <p className="text-sm text-purple-800 dark:text-purple-300">
                      {weatherData.current.wind_kph < 10 ? 
                        "Light breeze. Great for outdoor activities." :
                        weatherData.current.wind_kph < 25 ?
                        "Moderate wind. Good for sailing and kite flying." :
                        "Strong winds. Be cautious with outdoor activities."
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
