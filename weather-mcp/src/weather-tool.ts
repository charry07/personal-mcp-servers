import { getWeatherData } from "./utils";

interface WeatherParams {
  location: string;
  days?: number;
  details?: boolean;
}

interface WeatherResponse {
  location: string;
  elevation: string;
  currentWeather: {temperature: string; windSpeed: string; windDirection: string; weatherCode: string; time: string};
  forecast?: DailyForecast[];
  error?: string;
  details?: string;
}

interface DailyForecast {
  date: string;
  hours: HourlyData[];
}

interface HourlyData {
  time: string;
  temperature: string;
  humidity: string;
  precipitation: string;
  windSpeed: string;
  windDirection: string;
}

/**
 * Herramienta MCP para obtener información meteorológica
 */
async function getWeatherImpl(params: WeatherParams): Promise<WeatherResponse> {
  try {
    // Validar los parámetros
    const {location, days = 1, details = false} = params;

    if (!location) {
      return {
        error: 'Se requiere el parámetro "location" (coordenadas o nombre de ciudad)',
        location: "",
        elevation: "",
        currentWeather: {
          temperature: "",
          windSpeed: "",
          windDirection: "",
          weatherCode: "",
          time: "",
        },
      };
    }

    // Limitar el número de días entre 1 y 7
    const forecastDays = Math.min(Math.max(parseInt(days.toString()), 1), 7);
    
    // Obtener datos del clima usando el método centralizado de utils.ts
    const weatherResult = await getWeatherData(location, forecastDays);
    
    // Verificar si hay errores
    if (weatherResult.error || !weatherResult.data) {
      return {
        error: weatherResult.error || "Error desconocido al obtener datos del clima",
        details: weatherResult.details,
        location: "",
        elevation: "",
        currentWeather: {
          temperature: "",
          windSpeed: "",
          windDirection: "",
          weatherCode: "",
          time: "",
        },
      };
    }
    
    // Formatear la respuesta
    const result = formatWeatherResponse(weatherResult.data, details);
    return result;

  } catch (error) {
    return {
      error: "Error al obtener datos del clima",
      details: error instanceof Error ? error.message : String(error),
      location: "",
      elevation: "",
      currentWeather: {
        temperature: "",
        windSpeed: "",
        windDirection: "",
        weatherCode: "",
        time: "",
      },
    };
  }
}

// Define la herramienta getWeather según el formato específico que MCP espera
export const weatherTool = {
  name: "getWeather",
  description: "Obtiene información meteorológica para una ubicación específica",
  schema: {
    type: "function",
    function: {
      name: "getWeather",
      description: "Obtiene información meteorológica para una ubicación específica",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "Coordenadas (latitud,longitud) o nombre de la ciudad"
          },
          days: {
            type: "number",
            description: "Número de días para el pronóstico (1-7)",
            default: 1
          },
          details: {
            type: "boolean",
            description: "Si es true, devuelve información más detallada",
            default: false
          }
        },
        required: ["location"]
      },
    }
  },
  handler: getWeatherImpl
};

/**
 * Formatea la respuesta del clima para que sea más legible
 */
function formatWeatherResponse(data: any, includeDetails: boolean): WeatherResponse {
  try {
    // La API puede devolver current o current_weather dependiendo de la versión
    const current = data.current || data.current_weather;
    
    if (!current) {
      return {
        error: "Formato de respuesta de API no reconocido",
        location: "",
        elevation: "",
        currentWeather: {
          temperature: "",
          windSpeed: "",
          windDirection: "",
          weatherCode: "",
          time: "",
        },
      };
    }
    
    // Información básica del clima actual
    const currentWeather = {
      temperature: `${current.temperature || current.temperature_2m}°C`,
      windSpeed: `${current.windspeed || current.wind_speed || current.windspeed_10m} km/h`,
      windDirection: `${current.winddirection || current.wind_direction || current.winddirection_10m}°`,
      weatherCode: getWeatherDescription(current.weathercode || current.weather_code),
      time: new Date(current.time).toLocaleString(),
    };

    let response: WeatherResponse = {
      location: `${data.latitude}, ${data.longitude}`,
      elevation: `${data.elevation}m`,
      currentWeather,
    };

    // Incluir datos horarios si se solicitan detalles
    if (includeDetails && data.hourly) {
      // Agrupar por días
      const dailyForecasts = groupByDay(data.hourly);
      response.forecast = dailyForecasts;
    }

    return response;
  } catch (error) {
    return {
      error: "Error al formatear datos del clima",
      details: error instanceof Error ? error.message : String(error),
      location: "",
      elevation: "",
      currentWeather: {
        temperature: "",
        windSpeed: "",
        windDirection: "",
        weatherCode: "",
        time: "",
      },
    };
  }
}

/**
 * Agrupa datos horarios por día
 */
function groupByDay(hourlyData: any): DailyForecast[] {
  const days: Record<string, DailyForecast> = {};

  for (let i = 0; i < hourlyData.time.length; i++) {
    const date = new Date(hourlyData.time[i]);
    const dayKey = date.toISOString().split("T")[0];

    if (!days[dayKey]) {
      days[dayKey] = {
        date: dayKey,
        hours: [],
      };
    }

    days[dayKey].hours.push({
      time: date.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"}),
      temperature: `${hourlyData.temperature_2m[i]}${hourlyData.temperature_2m_unit || "°C"}`,
      humidity: `${hourlyData.relativehumidity_2m[i]}%`,
      precipitation: `${hourlyData.precipitation[i]} mm`,
      windSpeed: `${hourlyData.windspeed_10m[i]} km/h`,
      windDirection: `${hourlyData.winddirection_10m[i]}°`,
    });
  }

  return Object.values(days);
}

/**
 * Convierte códigos meteorológicos en descripciones
 */
function getWeatherDescription(code: number): string {
  const weatherCodes: Record<number, string> = {
    0: "Cielo despejado",
    1: "Principalmente despejado",
    2: "Parcialmente nublado",
    3: "Nublado",
    45: "Niebla",
    48: "Niebla con escarcha",
    51: "Llovizna ligera",
    53: "Llovizna moderada",
    55: "Llovizna intensa",
    56: "Llovizna helada ligera",
    57: "Llovizna helada intensa",
    61: "Lluvia ligera",
    63: "Lluvia moderada",
    65: "Lluvia intensa",
    66: "Lluvia helada ligera",
    67: "Lluvia helada intensa",
    71: "Nevada ligera",
    73: "Nevada moderada",
    75: "Nevada intensa",
    77: "Granos de nieve",
    80: "Chubascos ligeros",
    81: "Chubascos moderados",
    82: "Chubascos intensos",
    85: "Chubascos de nieve ligeros",
    86: "Chubascos de nieve intensos",
    95: "Tormenta",
    96: "Tormenta con granizo ligero",
    99: "Tormenta con granizo intenso",
  };

  return weatherCodes[code] || `Código desconocido (${code})`;
}

export type { WeatherParams, WeatherResponse };

