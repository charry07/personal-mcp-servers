# 🌦️ Weather MCP Server

Un servidor MCP (Model Context Protocol) para consultar información meteorológica en tiempo real utilizando la API Open-Meteo. Este servidor permite a modelos de lenguaje acceder a datos meteorológicos actualizados sin necesidad de API keys.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Model Context Protocol](https://img.shields.io/badge/MCP-compatible-orange)

## 🚀 Características

- ✅ Consulta de información meteorológica actual por coordenadas o nombre de ciudad
- ✅ Pronósticos para hasta 7 días
- ✅ Datos detallados: temperatura, humedad, precipitación, viento, códigos meteorológicos
- ✅ Integración perfecta con VS Code y modelos de lenguaje que soporten MCP
- ✅ No requiere API key (utiliza la API gratuita de Open-Meteo)
- ✅ Soporte para múltiples idiomas en nombres de ubicaciones
- ✅ Respuestas formateadas con descripciones legibles de las condiciones meteorológicas

## 📋 Requisitos previos

- Node.js 18 o superior
- pnpm (o npm/yarn)
- VS Code (para integración con modelos de lenguaje)

## 💻 Instalación

1. Clona este repositorio:

```bash
git clone https://github.com/tu-usuario/personal-mcp-servers.git
cd personal-mcp-servers/weather-mcp
```

2. Instala las dependencias:

```bash
pnpm install
# O si prefieres npm
npm install
```

3. Compila e inicia el servidor:

```bash
pnpm build && pnpm start
# O con npm
npm run build && npm start
```

## ⚙️ Configuración en VS Code

Para utilizar este servidor MCP con VS Code, añade esta configuración a tu `settings.json`:

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

Ejemplos:
- macOS/Linux: `/Users/tunombre/personal-mcp-servers`
- Windows: `C:\\Users\\tunombre\\personal-mcp-servers`

También puedes usar rutas relativas desde tu workspace de VS Code si el repositorio está dentro del workspace.

## 🔧 Herramientas disponibles

### getWeather

Obtiene información meteorológica detallada para una ubicación específica.

**Parámetros:**
| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `location` | string | Sí | - | Coordenadas (latitud,longitud) o nombre de la ciudad |
| `days` | number | No | 1 | Número de días para el pronóstico (1-7) |
| `details` | boolean | No | false | Si es true, devuelve información por hora más detallada |

**Ejemplos de uso:**

```
// Clima actual en Guarne, Colombia
getWeather(location: "Guarne")

// Pronóstico detallado para 3 días en Medellín
getWeather(location: "Medellín", days: 3, details: true)

// Usando coordenadas directamente
getWeather(location: "6.2505,-75.5630", days: 2, details: true)
```

## 📊 Ejemplos de respuesta

### Respuesta básica:
```json
{
  "location": "Guarne, Colombia",
  "elevation": "2138m",
  "currentWeather": {
    "temperature": "21.3°C",
    "windSpeed": "5.2 km/h",
    "windDirection": "120°",
    "weatherCode": "Parcialmente nublado",
    "time": "23/4/2025, 14:00:00"
  }
}
```

### Respuesta detallada (con details: true):
```json
{
  "location": "Medellín, Colombia",
  "elevation": "1493m",
  "currentWeather": {
    "temperature": "25.8°C",
    "windSpeed": "7.9 km/h",
    "windDirection": "270°",
    "weatherCode": "Nublado",
    "time": "23/4/2025, 19:30:00"
  },
  "forecast": [
    {
      "date": "2025-04-23",
      "hours": [
        {
          "time": "12:00 PM",
          "temperature": "18.0°C",
          "humidity": "94%",
          "precipitation": "0 mm",
          "windSpeed": "2.3 km/h",
          "windDirection": "72°"
        },
        // ... más horas
      ]
    },
    // ... más días
  ]
}
```

## ❓ Códigos meteorológicos

El servidor traduce automáticamente los códigos meteorológicos numéricos a descripciones en español:

| Código | Descripción |
|--------|-------------|
| 0 | Cielo despejado |
| 1 | Principalmente despejado |
| 2 | Parcialmente nublado |
| 3 | Nublado |
| 45, 48 | Niebla |
| 51-57 | Llovizna (diferentes intensidades) |
| 61-67 | Lluvia (diferentes intensidades) |
| 71-77 | Nieve (diferentes intensidades) |
| 80-82 | Chubascos |
| 95-99 | Tormenta |

## 🛠️ Desarrollo

### Estructura del proyecto

- `index.ts`: Punto de entrada principal y lógica del servidor MCP
- `package.json`: Dependencias y scripts
- `tsconfig.json`: Configuración de TypeScript

### Comandos útiles

```bash
# Compilar el proyecto
pnpm build

# Iniciar el servidor
pnpm start

# Desarrollo con recarga automática
pnpm dev
```

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - mira el archivo LICENSE para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir lo que te gustaría cambiar.

---

Desarrollado con ❤️ como parte del ecosistema de Model Context Protocol (MCP).