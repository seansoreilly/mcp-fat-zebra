import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface WeatherInput {
  location: string;
}

class WeatherTool extends MCPTool<WeatherInput> {
  name = "get_weather";
  description = "Retrieve current weather information for a location";

  schema = {
    location: {
      type: z.string(),
      description: "The city name or location to get weather for",
    },
  };

  async execute(input: WeatherInput) {
    // Mock weather data - in a real implementation, this would call a weather API
    const weatherConditions = ["Sunny", "Cloudy", "Rainy", "Snowy", "Partly Cloudy", "Thunderstorms"];
    const temperatures = Math.floor(Math.random() * 35) + 5; // Random temperature between 5-40°C
    const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    
    return {
      location: input.location,
      temperature: `${temperatures}°C`,
      condition: condition,
      humidity: `${Math.floor(Math.random() * 60) + 30}%`, // Random humidity between 30-90%
      timestamp: new Date().toISOString()
    };
  }
}

export default WeatherTool; 