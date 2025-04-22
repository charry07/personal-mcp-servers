import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {weatherTool} from "./src/weather-tool";

// Crear un nuevo servidor MCP
export const server = new McpServer({
  name: "Weather MCP Server",
  description: "Un servidor de ejemplo para el Weather MCP",
  version: "1.0.0",
  tools: [weatherTool],
});

const transport = new StdioServerTransport();
(async () => {
  await server.connect(transport);
})();
