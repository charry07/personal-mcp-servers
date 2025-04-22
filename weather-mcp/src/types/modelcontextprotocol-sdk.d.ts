declare module '@modelcontextprotocol/sdk' {
  export class MCPServer {
    constructor();
    
    registerTool(name: string, callback: (params: any) => Promise<any>): void;
    
    listen(): Promise<void>;
  }
}