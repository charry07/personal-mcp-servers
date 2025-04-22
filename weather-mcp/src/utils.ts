import * as fs from 'fs';

// Función para log que escribe a un archivo en lugar de stdout
function logToFile(message: string) {
  const logPath = '/tmp/weather-mcp.log';
  fs.appendFileSync(logPath, new Date().toISOString() + ' - ' + message + '\n');
}

interface Coordinates {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
  region: string;
}

interface GeocodingError {
  error: string;
  details?: string;
}

interface WeatherData {
  data: any;
  error?: string;
  details?: string;
}

/**
 * Geocodifica una ubicación (ciudad, dirección) a coordenadas
 * Utiliza la API de geocodificación de Open-Meteo
 */
async function geocodeLocation(locationName: string): Promise<Coordinates | GeocodingError> {
  try {
    logToFile(`Geocodificando ubicación: ${locationName}`);
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1&language=es&format=json`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      logToFile(`No se encontró la ubicación: ${locationName}`);
      return {error: `No se encontró la ubicación: ${locationName}`};
    }

    const location = data.results[0];
    logToFile(`Ubicación encontrada: ${location.name}, ${location.country} (${location.latitude}, ${location.longitude})`);

    return {
      latitude: location.latitude,
      longitude: location.longitude,
      name: location.name,
      country: location.country,
      region: location.region || "",
    };
  } catch (error) {
    logToFile(`Error en la geocodificación: ${error}`);
    return {
      error: "Error al geocodificar la ubicación",
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Obtiene los datos del clima para las coordenadas especificadas
 * @param latitude Latitud
 * @param longitude Longitud
 * @param forecastDays Número de días para el pronóstico (1-7)
 */
async function fetchWeatherData(latitude: number, longitude: number, forecastDays: number): Promise<WeatherData> {
  try {
    logToFile(`Consultando datos del clima para (${latitude}, ${longitude}), días: ${forecastDays}`);
    
    // Nota: La API ha cambiado, asegúrate de usar el endpoint correcto con los parámetros correctos
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m&forecast_days=${forecastDays}`;
    
    logToFile(`URL de la API: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    logToFile(`Datos recibidos correctamente de la API`);
    return { data };
  } catch (error) {
    logToFile(`Error al obtener datos del clima: ${error}`);
    return {
      data: null,
      error: "Error al obtener datos del clima",
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Obtiene información del clima para una ubicación
 * Maneja automáticamente la geocodificación si se proporciona un nombre de ubicación
 * @param location Coordenadas "lat,lon" o nombre de la ubicación
 * @param forecastDays Número de días para el pronóstico (1-7)
 */
async function getWeatherData(location: string, forecastDays: number): Promise<WeatherData> {
  try {
    let latitude: number, longitude: number;

    // Comprobar si es un nombre de ubicación o coordenadas
    if (!location.match(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/)) {
      // Es un nombre de ubicación, necesitamos geocodificarlo
      logToFile(`Procesando nombre de ubicación: ${location}`);
      const coordinates = await geocodeLocation(location);
      if ("error" in coordinates) {
        return {
          data: null,
          error: coordinates.error,
          details: coordinates.details
        };
      }
      latitude = coordinates.latitude;
      longitude = coordinates.longitude;
    } else {
      // Son coordenadas directas
      logToFile(`Procesando coordenadas directas: ${location}`);
      const [lat, lon] = location.split(",");
      latitude = parseFloat(lat);
      longitude = parseFloat(lon);
    }

    // Obtener los datos del clima
    return await fetchWeatherData(latitude, longitude, forecastDays);
  } catch (error) {
    logToFile(`Error al procesar la solicitud del clima: ${error}`);
    return {
      data: null,
      error: "Error al procesar la solicitud del clima",
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

export {geocodeLocation, fetchWeatherData, getWeatherData};
export type {Coordinates, GeocodingError, WeatherData};
