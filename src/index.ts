import { MCPServer } from "mcp-framework";
import ExampleTool from "./tools/ExampleTool.js";
import WeatherTool from "./tools/WeatherTool.js";
import CalculatorTool from "./tools/CalculatorTool.js";
import UrlShortenerTool from "./tools/UrlShortenerTool.js";
import FatZebraTool from "./tools/FatZebraTool.js";
import FatZebraTokenizeTool from "./tools/FatZebraTokenizeTool.js";
import FatZebraTokenPaymentTool from "./tools/FatZebraTokenPaymentTool.js";
import FatZebraRefundTool from "./tools/FatZebraRefundTool.js";
import FatZebra3DSecureTool from "./tools/FatZebra3DSecureTool.js";
import FatZebraWebhookTool from "./tools/FatZebraWebhookTool.js";
import FatZebraDirectDebitTool from "./tools/FatZebraDirectDebitTool.js";
import DocumentationResource from "./tools/DocumentationResource.js";

process.stderr.write("[INFO] Starting MCP Fat Zebra server...\n");

// Create the MCP server instance
const server = new MCPServer();

// The MCP Framework automatically discovers and loads tools and resources
// from the tools directory when the server starts

// Start the server
server.start()
  .then(() => {
    process.stderr.write("[INFO] MCP Fat Zebra server is running!\n");
  })
  .catch((error) => {
    process.stderr.write(`[ERROR] Failed to start server: ${error}\n`);
  });