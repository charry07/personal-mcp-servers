"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.geocodeLocation = geocodeLocation;
const axios_1 = __importDefault(require("axios"));
/**
 * Geocodifica una ubicación (ciudad, dirección) a coordenadas
 * Utiliza la API de geocodificación de Open-Meteo
 */
async function geocodeLocation(locationName) {
    try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1&language=es&format=json`;
        const response = await axios_1.default.get(url);
        if (!response.data.results || response.data.results.length === 0) {
            return {
                error: `No se encontró la ubicación: ${locationName}`
            };
        }
        const location = response.data.results[0];
        return {
            latitude: location.latitude,
            longitude: location.longitude,
            name: location.name,
            country: location.country,
            region: location.admin1
        };
    }
    catch (error) {
        console.error('Error en la geocodificación:', error);
        return {
            error: 'Error al geocodificar la ubicación',
            details: error instanceof Error ? error.message : String(error)
        };
    }
}
