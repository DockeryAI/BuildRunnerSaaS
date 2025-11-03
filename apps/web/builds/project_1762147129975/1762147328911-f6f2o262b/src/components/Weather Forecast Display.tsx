import React, { useState, useEffect } from 'react';

interface WeatherData {
  temperature: number;
  conditions: string;
  humidity: number;
  windSpeed: number;
  location: string;
}

interface WeatherForecastProps {
  apiKey: string;
  location: string;
}

interface WeatherError {
  message: string;
}

/**
 * Weather Forecast Display Component
 * Displays current weather data for a given location
 * @param {string} apiKey - API key for weather service
 * @param {string} location - Location to get weather for
 */
const WeatherForecast: React.FC<WeatherForecastProps> = ({ apiKey, location }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<WeatherError | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`
        );

        if (!response.ok) {
          throw new Error('Weather data fetch failed');
        }

        const data = await response.json();
        
        setWeatherData({
          temperature: data.current.temp_c,
          conditions: data.current.condition.text,
          humidity: data.current.humidity,
          windSpeed: data.current.wind_kph,
          location: data.location.name
        });
        
        setError(null);
      } catch (err) {
        setError({ message: err instanceof Error ? err.message : 'Failed to fetch weather data' });
        setWeatherData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [apiKey, location]);

  if (loading) {
    return <div className="weather-loading">Loading weather data...</div>;
  }

  if (error) {
    return (
      <div className="weather-error">
        Error: {error.message}
      </div>
    );
  }

  if (!weatherData) {
    return <div className="weather-no-data">No weather data available</div>;
  }

  return (
    <div className="weather-forecast">
      <h2>{weatherData.location} Weather</h2>
      <div className="weather-details">
        <div className="weather-row">
          <span className="label">Temperature:</span>
          <span className="value">{weatherData.temperature}°C</span>
        </div>
        <div className="weather-row">
          <span className="label">Conditions:</span>
          <span className="value">{weatherData.conditions}</span>
        </div>
        <div className="weather-row">
          <span className="label">Humidity:</span>
          <span className="value">{weatherData.humidity}%</span>
        </div>
        <div className="weather-row">
          <span className="label">Wind Speed:</span>
          <span className="value">{weatherData.windSpeed} km/h</span>
        </div>
      </div>
    </div>
  );
};

const weatherStyles = `
  .weather-forecast {
    padding: 20px;
    border-radius: 8px;
    background-color: #f5f5f5;
    max-width: 400px;
    margin: 20px auto;
  }

  .weather-details {
    margin-top: 15px;
  }

  .weather-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #ddd;
  }

  .weather-row:last-child {
    border-bottom: none;
  }

  .label {
    font-weight: bold;
    color: #666;
  }

  .value {
    color: #333;
  }

  .weather-loading,
  .weather-error,
  .weather-no-data {
    text-align: center;
    padding: 20px;
    background-color: #f5f5f5;
    border-radius: 8px;
    max-width: 400px;
    margin: 20px auto;
  }

  .weather-error {
    color: #d32f2f;
  }
`;

const styleSheet = document.createElement('style');
styleSheet.innerText = weatherStyles;
document.head.appendChild(styleSheet);

export default WeatherForecast;