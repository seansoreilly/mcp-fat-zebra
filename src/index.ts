import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Import tools
import FatZebraPassthroughTool from "./tools/FatZebraPassthroughTool.js";

// Initialize the MCP server
const server = new McpServer({
  name: "fat-zebra-server",
  version: "1.0.0"
});

// Register tools
server.tool(
  FatZebraPassthroughTool.name,
  FatZebraPassthroughTool.description,
  FatZebraPassthroughTool.schema,
  FatZebraPassthroughTool.execute
);

// Start the server with stdio transport
const transport = new StdioServerTransport();
server.connect(transport)
  .then(() => {
    console.log("Tools and resources loaded successfully.");
    console.log("Server started successfully. Resources should be available now.");
  })
  .catch((error: Error) => {
    process.stderr.write(`[ERROR] Failed to initialize tools or start server: ${error}\n`);
  });
