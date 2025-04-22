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
    console.error("Error en la geocodificación:", error);
    return {
      error: "Error al geocodificar la ubicación",
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

export {geocodeLocation};
export type {Coordinates, GeocodingError};
