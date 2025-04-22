import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { weatherTool } from "./src/weather-tool";

// Crear un nuevo servidor MCP
const server = new McpServer({
  name: "Weather MCP Server",
  description: "Un servidor MCP para consultar información del clima",
  version: "1.0.0",
  tools: [weatherTool],
});

const transport = new StdioServerTransport();
(async () => {
  console.log("Starting Weather MCP Server...");
  await server.connect(transport);
  console.log("Weather MCP Server connected");
})();
