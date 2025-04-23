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
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1&language=es&format=json`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return {error: `No se encontró la ubicación: ${locationName}`};
    }

    const location = data.results[0];

    return {
      latitude: location.latitude,
      longitude: location.longitude,
      name: location.name,
      country: location.country,
      region: location.region || "",
    };
  } catch (error) {
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
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m&forecast_days=${forecastDays}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { data };
  } catch (error) {
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
      const [lat, lon] = location.split(",");
      latitude = parseFloat(lat);
      longitude = parseFloat(lon);
    }

    // Obtener los datos del clima
    return await fetchWeatherData(latitude, longitude, forecastDays);
  } catch (error) {
    return {
      data: null,
      error: "Error al procesar la solicitud del clima",
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

export {geocodeLocation, fetchWeatherData, getWeatherData};
export type {Coordinates, GeocodingError, WeatherData};
