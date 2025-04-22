"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_1 = require("@modelcontextprotocol/sdk");
const weather_tool_1 = require("./weather-tool");
// Crear un nuevo servidor MCP
const server = new sdk_1.MCPServer();
// Registrar la herramienta del clima
server.registerTool('getWeather', weather_tool_1.weatherTool);
// Iniciar el servidor
server.listen().then(() => {
    console.log('Weather MCP Server está ejecutándose (TypeScript version)');
}).catch((error) => {
    console.error('Error al iniciar el servidor:', error);
});
