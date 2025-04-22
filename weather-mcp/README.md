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

## Configuración en VS Code

Para usar este servidor MCP con VS Code, añade esta configuración a tu `settings.json`:

```json
"mcp": {
  "servers": {
    "weather": {
      "command": "npx",
      "args": ["-y", "tsx", "RUTA_AL_REPOSITORIO/weather-mcp/index.ts"]
    }
  }
}
```

**Importante:** Reemplaza `RUTA_AL_REPOSITORIO` con la ruta absoluta donde has clonado este repositorio en tu sistema.

Por ejemplo:
- En macOS/Linux: `/Users/tunombre/personal-mcp-servers`
- En Windows: `C:\\Users\\tunombre\\personal-mcp-servers`

También puedes usar rutas relativas desde tu workspace de VS Code si el repositorio está dentro del workspace.

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