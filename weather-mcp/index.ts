import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Interfaz para los parámetros de la herramienta
interface WeatherParams {
  location: string;
  days?: number;
  details?: boolean;
}

// Interfaz para los datos por hora del pronóstico
interface HourlyData {
  time: string;
  temperature: string;
  humidity: string;
  precipitation: string;
  windSpeed: string;
  windDirection: string;
}

// Interfaz para el pronóstico diario
interface DailyForecast {
  date: string;
  hours: HourlyData[];
}

// Interfaz para la respuesta del clima
interface WeatherResponse {
  location: string;
  elevation: string;
  currentWeather: {
    temperature: string;
    windSpeed: string;
    windDirection: string;
    weatherCode: string;
    time: string;
  };
  forecast?: DailyForecast[];
}

// Crear y configurar el servidor MCP
async function startServer() {
  try {
    // Crear el servidor MCP
    const server = new McpServer({
      name: "Weather MCP Server",
      description: "Servidor MCP para consultar información del clima",
      version: "1.0.0",
    });

    // Registrar la herramienta getWeather
    server.tool(
      "getWeather",
      "Obtiene información meteorológica para una ubicación específica",
      {
        parameters: z.object({
          location: z.string().describe("Coordenadas (latitud,longitud) o nombre de la ciudad"),
          days: z.number().default(1).describe("Número de días para el pronóstico (1-7)"),
          details: z.boolean().default(false).describe("Si es true, devuelve información más detallada")
        })
      },
      async (args: { parameters: WeatherParams }) => {
        try {
          const { location, days = 1, details = false } = args.parameters;
          
          if (!location) {
            return {
              content: [{
                type: "text",
                text: JSON.stringify({
                  error: 'Se requiere el parámetro "location"',
                  message: "Debe proporcionar una ubicación (coordenadas o nombre de ciudad)"
                })
              }],
              isError: true
            };
          }
          
          // Determinar si es coordenadas o nombre de ubicación
          let latitude: number, longitude: number;
          let locationInfo = "";
          
          if (typeof location === "string" && !location.match(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/)) {
            // Es un nombre de ubicación, necesitamos geocodificarlo
            const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=es&format=json`;
            
            const geocodeResponse = await fetch(geocodeUrl);
            const geocodeData = await geocodeResponse.json();
            
            if (!geocodeData.results || geocodeData.results.length === 0) {
              return {
                content: [{
                  type: "text",
                  text: JSON.stringify({
                    error: `No se encontró la ubicación: ${location}`,
                    message: `No se pudo encontrar información para: ${location}`
                  })
                }],
                isError: true
              };
            }
            
            const geoLocation = geocodeData.results[0];
            latitude = geoLocation.latitude;
            longitude = geoLocation.longitude;
            locationInfo = `${geoLocation.name}, ${geoLocation.country}`;
          } else {
            // Son coordenadas directas
            const [lat, lon] = location.split(",");
            latitude = parseFloat(lat);
            longitude = parseFloat(lon);
            locationInfo = `${latitude}, ${longitude}`;
          }
          
          // Limitar el número de días entre 1 y 7
          const forecastDays = Math.min(Math.max(parseInt(String(days)), 1), 7);
          
          // Construir la URL de la API meteorológica
          const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m&forecast_days=${forecastDays}`;
          
          // Consultar datos del clima
          const weatherResponse = await fetch(weatherUrl);
          
          if (!weatherResponse.ok) {
            const errMsg = `Error en la API de clima: ${weatherResponse.status}`;
            return {
              content: [{
                type: "text",
                text: JSON.stringify({
                  error: "Error en la API del clima",
                  message: errMsg
                })
              }],
              isError: true
            };
          }
          
          const weatherData = await weatherResponse.json();
          
          // Construir respuesta según el formato deseado
          const current = weatherData.current;
          
          if (!current) {
            return {
              content: [{
                type: "text",
                text: JSON.stringify({
                  error: "Formato de respuesta no esperado",
                  message: "La API de clima no devolvió datos en el formato esperado"
                })
              }],
              isError: true
            };
          }
          
          // Formato de respuesta básica
          const result: WeatherResponse = {
            location: locationInfo,
            elevation: `${weatherData.elevation}m`,
            currentWeather: {
              temperature: `${current.temperature_2m}°C`,
              windSpeed: `${current.wind_speed_10m} km/h`,
              windDirection: `${current.wind_direction_10m}°`,
              weatherCode: getWeatherDescription(current.weather_code),
              time: new Date(current.time).toLocaleString(),
            }
          };
          
          // Añadir pronóstico detallado si se solicita
          if (details && weatherData.hourly) {
            const hourlyData = weatherData.hourly;
            
            // Agrupar por días
            const daysMap: Record<string, DailyForecast> = {};
            
            for (let i = 0; i < hourlyData.time.length; i++) {
              const date = new Date(hourlyData.time[i]);
              const dayKey = date.toISOString().split("T")[0];
              
              if (!daysMap[dayKey]) {
                daysMap[dayKey] = {
                  date: dayKey,
                  hours: [],
                };
              }
              
              daysMap[dayKey].hours.push({
                time: date.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"}),
                temperature: `${hourlyData.temperature_2m[i]}°C`,
                humidity: `${hourlyData.relative_humidity_2m[i]}%`,
                precipitation: `${hourlyData.precipitation[i]} mm`,
                windSpeed: `${hourlyData.wind_speed_10m[i]} km/h`,
                windDirection: `${hourlyData.wind_direction_10m[i]}°`,
              });
            }
            
            result.forecast = Object.values(daysMap);
          }
          
          // Devolvemos la respuesta en el formato que espera MCP
          return {
            content: [{
              type: "text",
              text: JSON.stringify(result)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                error: "Error al obtener datos del clima",
                message: error instanceof Error ? error.message : String(error)
              })
            }],
            isError: true
          };
        }
      }
    );

    // Conectar el servidor con transporte estándar
    const transport = new StdioServerTransport();
    await server.connect(transport);
  } catch (error) {
    console.error(`Error al iniciar el servidor: ${error}`);
  }
}

// Función auxiliar para convertir códigos de clima a descripciones
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

// Iniciar el servidor
startServer();
