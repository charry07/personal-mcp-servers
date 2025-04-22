# Weather MCP Server

Un servidor MCP para consultar información del clima utilizando la API Open-Meteo (sin API key).

## Características

- Consulta información meteorológica actual por coordenadas o nombre de ciudad
- Pronóstico para hasta 7 días
- Datos detallados: temperatura, humedad, precipitación, viento, etc.
- No requiere API key (utilizando Open-Meteo API)

## Instalación

1. Instala las dependencias:

```bash
cd weather-mcp
npm install
```

2. Inicia el servidor:

```bash
npm start
```

## Configuración en tu entorno

Para usar este servidor MCP con Claude Desktop, añade esta configuración a tu `settings.json`:

```json
"mcp": {
  "servers": {
    "weather": {
      "command": "node",
      "args": ["/Users/andersoncharry/My_WP/personal-mcp-servers/weather-mcp/src/index.js"]
    }
  }
}
```

Para usar con otros entornos compatibles con MCP, sigue la documentación específica de ese entorno.

## Herramientas disponibles

### getWeather

Obtiene la información meteorológica para una ubicación específica.

Parámetros:
- `location` (obligatorio): Coordenadas (latitud,longitud) o nombre de la ciudad
- `days` (opcional, predeterminado: 1): Número de días para el pronóstico (1-7)
- `details` (opcional, predeterminado: false): Si es true, devuelve información más detallada

Ejemplo de uso:
```
getWeather(location: "Guarne, Antioquia", days: 3, details: true)
```

## Ejemplos de respuesta

### Respuesta básica:
```json
{
  "location": "6.2805, -75.4427",
  "elevation": "2143m",
  "currentWeather": {
    "temperature": "21°C",
    "windSpeed": "5.2 km/h",
    "windDirection": "120°",
    "weatherCode": "Parcialmente nublado",
    "time": "21/4/2025, 14:00:00"
  }
}
```

### Respuesta detallada (con details: true):
Incluye pronóstico por horas para los días solicitados.