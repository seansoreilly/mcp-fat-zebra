import { MCPServer } from "mcp-framework";

process.stdout.write("[INFO] Starting MCP Fat Zebra server...\n");

// Create the MCP server instance
const server = new MCPServer();

// Start the MCP server
server.start()
  .then(() => {
    process.stdout.write(`[INFO] MCP Fat Zebra server is running with stdio transport!\n`);
  })
  .catch((error) => {
    process.stderr.write(`[ERROR] Failed to start server: ${error}\n`);
    process.exit(1);
  });