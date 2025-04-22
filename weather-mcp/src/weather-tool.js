const axios = require('axios');
const { geocodeLocation } = require('./utils');

/**
 * Herramienta MCP para obtener información meteorológica
 */
async function weatherTool(params) {
  try {
    // Validar los parámetros
    const { location, days = 1, details = false } = params;
    
    if (!location) {
      return { error: 'Se requiere el parámetro "location" (coordenadas o nombre de ciudad)' };
    }
    
    // Limitar el número de días entre 1 y 7
    const forecastDays = Math.min(Math.max(parseInt(days), 1), 7);
    
    // Obtener coordenadas si se proporciona un nombre de ubicación
    let latitude, longitude;
    
    if (typeof location === 'string' && !location.match(/^-?\\d+(\\.\\d+)?,-?\\d+(\\.\\d+)?$/)) {
      // Es un nombre de ubicación, necesitamos geocodificarlo
      const coordinates = await geocodeLocation(location);
      if (coordinates.error) {
        return coordinates;
      }
      latitude = coordinates.latitude;
      longitude = coordinates.longitude;
    } else {
      // Son coordenadas directas
      if (typeof location === 'string') {
        const [lat, lon] = location.split(',');
        latitude = parseFloat(lat);
        longitude = parseFloat(lon);
      } else {
        return { error: 'Formato de ubicación inválido' };
      }
    }
    
    // Construir la URL de la API
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,precipitation,windspeed_10m,winddirection_10m&forecast_days=${forecastDays}`;
    
    // Realizar la petición a la API
    const response = await axios.get(url);
    const data = response.data;
    
    // Formatear la respuesta
    const result = formatWeatherResponse(data, details);
    
    return result;
    
  } catch (error) {
    console.error('Error al obtener datos del clima:', error);
    return {
      error: 'Error al obtener datos del clima',
      details: error.message
    };
  }
}

/**
 * Formatea la respuesta del clima para que sea más legible
 */
function formatWeatherResponse(data, includeDetails) {
  // Información básica del clima actual
  const currentWeather = {
    temperature: `${data.current_weather.temperature}°C`,
    windSpeed: `${data.current_weather.windspeed} km/h`,
    windDirection: `${data.current_weather.winddirection}°`,
    weatherCode: getWeatherDescription(data.current_weather.weathercode),
    time: new Date(data.current_weather.time).toLocaleString()
  };
  
  let response = {
    location: `${data.latitude}, ${data.longitude}`,
    elevation: `${data.elevation}m`,
    currentWeather
  };
  
  // Incluir datos horarios si se solicitan detalles
  if (includeDetails) {
    // Agrupar por días
    const dailyForecasts = groupByDay(data.hourly);
    response.forecast = dailyForecasts;
  }
  
  return response;
}

/**
 * Agrupa datos horarios por día
 */
function groupByDay(hourlyData) {
  const days = {};
  
  for (let i = 0; i < hourlyData.time.length; i++) {
    const date = new Date(hourlyData.time[i]);
    const dayKey = date.toISOString().split('T')[0];
    
    if (!days[dayKey]) {
      days[dayKey] = {
        date: dayKey,
        hours: []
      };
    }
    
    days[dayKey].hours.push({
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temperature: `${hourlyData.temperature_2m[i]}${hourlyData.temperature_2m_unit || '°C'}`,
      humidity: `${hourlyData.relativehumidity_2m[i]}%`,
      precipitation: `${hourlyData.precipitation[i]} mm`,
      windSpeed: `${hourlyData.windspeed_10m[i]} km/h`,
      windDirection: `${hourlyData.winddirection_10m[i]}°`
    });
  }
  
  return Object.values(days);
}

/**
 * Convierte códigos meteorológicos en descripciones
 */
function getWeatherDescription(code) {
  const weatherCodes = {
    0: 'Cielo despejado',
    1: 'Principalmente despejado',
    2: 'Parcialmente nublado',
    3: 'Nublado',
    45: 'Niebla',
    48: 'Niebla con escarcha',
    51: 'Llovizna ligera',
    53: 'Llovizna moderada',
    55: 'Llovizna intensa',
    56: 'Llovizna helada ligera',
    57: 'Llovizna helada intensa',
    61: 'Lluvia ligera',
    63: 'Lluvia moderada',
    65: 'Lluvia intensa',
    66: 'Lluvia helada ligera',
    67: 'Lluvia helada intensa',
    71: 'Nevada ligera',
    73: 'Nevada moderada',
    75: 'Nevada intensa',
    77: 'Granos de nieve',
    80: 'Chubascos ligeros',
    81: 'Chubascos moderados',
    82: 'Chubascos intensos',
    85: 'Chubascos de nieve ligeros',
    86: 'Chubascos de nieve intensos',
    95: 'Tormenta',
    96: 'Tormenta con granizo ligero',
    99: 'Tormenta con granizo intenso'
  };
  
  return weatherCodes[code] || `Código desconocido (${code})`;
}

module.exports = { weatherTool };