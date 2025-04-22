const sdk = require('@modelcontextprotocol/sdk/dist/cjs');
const { weatherTool } = require('./weather-tool');

// Crear un nuevo servidor MCP
const server = new sdk.server.MCPServer();

// Registrar la herramienta del clima
server.registerTool('getWeather', weatherTool);

// Iniciar el servidor
server.listen().then(() => {
  console.log('Weather MCP Server está ejecutándose en el puerto 3000');
}).catch(error => {
  console.error('Error al iniciar el servidor:', error);
});
