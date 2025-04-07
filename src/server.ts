// A simple Express server for health checks and HTTP endpoint
import express from 'express';
import { MCPServer } from 'mcp-framework';

const app = express();
const port = process.env.MCP_PORT ? parseInt(process.env.MCP_PORT) : 3000;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Start Express server
export function startServer(): Promise<void> {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`[INFO] HTTP server listening on port ${port}`);
      console.log(`[INFO] Health check endpoint available at http://localhost:${port}/health`);
      resolve();
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('[INFO] Shutting down HTTP server...');
      server.close();
      process.exit(0);
    });
  });
}

// Start MCP server
export async function startMCPServer(): Promise<void> {
  // Create the MCP server instance
  const server = new MCPServer();
  
  try {
    await server.start();
    console.log(`[INFO] MCP Fat Zebra server is running with stdio transport!`);
  } catch (error) {
    console.error(`[ERROR] Failed to start MCP server: ${error}`);
    process.exit(1);
  }
} 