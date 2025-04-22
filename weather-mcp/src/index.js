const { MCPServer } = require('@modelcontextprotocol/sdk');
const { weatherTool } = require('./weather-tool');

// Crear un nuevo servidor MCP
const server = new MCPServer();

// Registrar la herramienta del clima
server.registerTool('getWeather', weatherTool);

// Iniciar el servidor
server.listen().then(() => {
  console.log('Weather MCP Server está ejecutándose');
}).catch(error => {
  console.error('Error al iniciar el servidor:', error);
});