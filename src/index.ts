import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Import tools
import FatZebraPassthroughTool from "./tools/FatZebraPassthroughTool.js";

// Import card tools
import FatZebraStoreCardTool from "./tools/card/FatZebraStoreCardTool.js";
import FatZebraListStoredCardsTool from "./tools/card/FatZebraListStoredCardsTool.js";
import FatZebraDeleteStoredCardTool from "./tools/card/FatZebraDeleteStoredCardTool.js";

// Import payment tools
import FatZebraPaymentTool from "./tools/payment/FatZebraPaymentTool.js";
import FatZebraRefundTool from "./tools/payment/FatZebraRefundTool.js";
import FatZebraTokenPaymentTool from "./tools/payment/FatZebraTokenPaymentTool.js";
import FatZebraTokenizeTool from "./tools/payment/FatZebraTokenizeTool.js";
import FatZebra3DSecureTool from "./tools/payment/FatZebra3DSecureTool.js";
import FatZebraDirectDebitTool from "./tools/payment/FatZebraDirectDebitTool.js";

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

// Register card tools
server.tool(
  FatZebraStoreCardTool.name,
  FatZebraStoreCardTool.description,
  FatZebraStoreCardTool.schema,
  FatZebraStoreCardTool.execute
);

server.tool(
  FatZebraListStoredCardsTool.name,
  FatZebraListStoredCardsTool.description,
  FatZebraListStoredCardsTool.schema,
  FatZebraListStoredCardsTool.execute
);

server.tool(
  FatZebraDeleteStoredCardTool.name,
  FatZebraDeleteStoredCardTool.description,
  FatZebraDeleteStoredCardTool.schema,
  FatZebraDeleteStoredCardTool.execute
);

// Register payment tools
server.tool(
  FatZebraPaymentTool.name,
  FatZebraPaymentTool.description,
  FatZebraPaymentTool.schema,
  FatZebraPaymentTool.execute
);

server.tool(
  FatZebraRefundTool.name,
  FatZebraRefundTool.description,
  FatZebraRefundTool.schema,
  FatZebraRefundTool.execute
);

server.tool(
  FatZebraTokenPaymentTool.name,
  FatZebraTokenPaymentTool.description,
  FatZebraTokenPaymentTool.schema,
  FatZebraTokenPaymentTool.execute
);

server.tool(
  FatZebraTokenizeTool.name,
  FatZebraTokenizeTool.description,
  FatZebraTokenizeTool.schema,
  FatZebraTokenizeTool.execute
);

server.tool(
  FatZebra3DSecureTool.name,
  FatZebra3DSecureTool.description,
  FatZebra3DSecureTool.schema,
  FatZebra3DSecureTool.execute
);

server.tool(
  FatZebraDirectDebitTool.name,
  FatZebraDirectDebitTool.description,
  FatZebraDirectDebitTool.schema,
  FatZebraDirectDebitTool.execute
);

// Start the server with stdio transport
const transport = new StdioServerTransport();
server.connect(transport)
  .then(() => {
    // console.log("Tools and resources loaded successfully.");
    // console.log("Server started successfully. Resources should be available now.");
  })
  .catch((error: Error) => {
    process.stderr.write(`[ERROR] Failed to initialize tools or start server: ${error}\n`);
  });
