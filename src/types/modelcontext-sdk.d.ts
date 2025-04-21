declare module "@modelcontextprotocol/sdk/server/mcp.js" {
  export class McpServer {
    constructor(options: { name: string; version: string });
    tool(name: string, description: string, schema: any, execute: (input: any) => Promise<any>): void;
    connect(transport: any): Promise<void>;
  }
}

declare module "@modelcontextprotocol/sdk/server/stdio.js" {
  export class StdioServerTransport {
    constructor();
  }
}

declare module "@modelcontextprotocol/typescript-sdk/server/mcp.js" {
  export class McpServer {
    constructor(options: { name: string; version: string });
    tool(name: string, description: string, schema: any, execute: (input: any) => Promise<any>): void;
    connect(transport: any): Promise<void>;
  }
}

declare module "@modelcontextprotocol/sdk" {
  export class Tool {
    constructor();
    name: string;
    description: string;
    schema: Record<string, any>;
    execute(input: any): Promise<any>;
    read?(): Promise<ResourceContent[]>;
    uri?: string;
    mimeType?: string;
  }

  export interface ResourceContent {
    uri: string;
    content: string;
    contentType: string;
  }
}