import { MCPServer } from '@modelcontextprotocol/sdk';
import { weatherTool } from './weather-tool';

// Crear un nuevo servidor MCP
const server = new MCPServer();

// Registrar la herramienta del clima
server.registerTool('getWeather', weatherTool);

// Iniciar el servidor
server.listen().then(() => {
  console.log('Weather MCP Server está ejecutándose (TypeScript version)');
}).catch((error: Error) => {
  console.error('Error al iniciar el servidor:', error);
});