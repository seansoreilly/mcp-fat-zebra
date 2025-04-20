import { MCPServer } from "mcp-framework";

// Create the MCP server instance
const server = new MCPServer();

// The MCP Framework automatically discovers and loads tools and resources
// from the tools and resources directories when the server starts

// Start the server
server.start()
  .then(() => {
    console.log("MCP server started successfully. Resources should be available now.");
  })
  .catch((error) => {
    process.stderr.write(`[ERROR] Failed to start server: ${error}\n`);
  });