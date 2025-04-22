import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {weatherTool} from "./src/weather-tool";
import * as fs from "fs";

// Función para log que escribe a un archivo en lugar de stdout
function logToFile(message: string) {
  const logPath = "/tmp/weather-mcp.log";
  fs.appendFileSync(logPath, new Date().toISOString() + " - " + message + "\n");
}

// Logs para depuración que no interfieren con el protocolo
logToFile("Weather MCP Server iniciando...");
logToFile(
  `Herramientas a registrar: ${JSON.stringify({
    name: weatherTool.name,
    description: weatherTool.description,
  })}`
);

// Crear un nuevo servidor MCP
export const server = new McpServer({
  name: "Weather MCP Server",
  description: "Un servidor MCP para consultar información del clima",
  version: "1.0.0",
  tools: [weatherTool],
});

const transport = new StdioServerTransport();
(async () => {
  logToFile("Conectando servidor...");
  try {
    await server.connect(transport);
    logToFile("Weather MCP Server conectado correctamente");
  } catch (error) {
    logToFile(`Error al conectar el servidor: ${error}`);
  }
})();
