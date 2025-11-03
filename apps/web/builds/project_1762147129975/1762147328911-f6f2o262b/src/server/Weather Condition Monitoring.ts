import React, { useState, useEffect } from 'react';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  conditions: string;
}

interface WeatherMonitorProps {
  latitude: number;
  longitude: number;
  updateInterval?: number;
}

/**
 * Weather condition monitoring component that displays current weather data
 * @param {WeatherMonitorProps} props - Component props
 * @returns {JSX.Element} Weather monitoring component
 */
const WeatherMonitor: React.FC<WeatherMonitorProps> = ({ 
  latitude,
  longitude,
  updateInterval = 300000 // 5 minutes default
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Fetches current weather data from API
   */
  const fetchWeatherData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${process.env.REACT_APP_WEATHER_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();

      setWeatherData({
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed),
        conditions: data.weather[0].main
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
    
    const interval = setInterval(() => {
      fetchWeatherData();
    }, updateInterval);

    return () => clearInterval(interval);
  }, [latitude, longitude, updateInterval]);

  if (loading) {
    return <div className="weather-monitor loading">Loading weather data...</div>;
  }

  if (error) {
    return <div className="weather-monitor error">Error: {error}</div>;
  }

  if (!weatherData) {
    return <div className="weather-monitor no-data">No weather data available</div>;
  }

  return (
    <div className="weather-monitor">
      <div className="weather-condition">
        <h2>Current Weather</h2>
        <div className="weather-data">
          <div className="data-row">
            <span>Temperature:</span>
            <span>{weatherData.temperature}°C</span>
          </div>
          <div className="data-row">
            <span>Humidity:</span>
            <span>{weatherData.humidity}%</span>
          </div>
          <div className="data-row">
            <span>Wind Speed:</span>
            <span>{weatherData.windSpeed} m/s</span>
          </div>
          <div className="data-row">
            <span>Conditions:</span>
            <span>{weatherData.conditions}</span>
          </div>
        </div>
        <button 
          className="refresh-button"
          onClick={fetchWeatherData}
          disabled={loading}
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default WeatherMonitor;