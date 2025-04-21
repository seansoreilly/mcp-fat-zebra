import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Import tools
import FatZebraPassthroughTool from "./tools/FatZebraPassthroughTool.js";

// Import webhook tools
import FatZebraCreateWebhookTool from "./tools/webhook/FatZebraCreateWebhookTool.js";
import FatZebraListWebhooksTool from "./tools/webhook/FatZebraListWebhooksTool.js";
import FatZebraDeleteWebhookTool from "./tools/webhook/FatZebraDeleteWebhookTool.js";

// Import card tools
import FatZebraStoreCardTool from "./tools/card/FatZebraStoreCardTool.js";
import FatZebraListStoredCardsTool from "./tools/card/FatZebraListStoredCardsTool.js";
import FatZebraDeleteStoredCardTool from "./tools/card/FatZebraDeleteStoredCardTool.js";

// Import customer tools
import FatZebraCreateCustomerTool from "./tools/customer/FatZebraCreateCustomerTool.js";
import FatZebraUpdateCustomerTool from "./tools/customer/FatZebraUpdateCustomerTool.js";

// Import batch tools
import FatZebraBatchDetailsTool from "./tools/batch/FatZebraBatchDetailsTool.js";
import FatZebraCreateBatchTool from "./tools/batch/FatZebraCreateBatchTool.js";
import FatZebraListBatchesTool from "./tools/batch/FatZebraListBatchesTool.js";
import FatZebraReconciliationReportTool from "./tools/batch/FatZebraReconciliationReportTool.js";

// Import transaction tools
import FatZebraListTransactionsTool from "./tools/transaction/FatZebraListTransactionsTool.js";
import FatZebraSearchRefundsTool from "./tools/transaction/FatZebraSearchRefundsTool.js";
import FatZebraTransactionHistoryTool from "./tools/transaction/FatZebraTransactionHistoryTool.js";
import FatZebraTransactionStatusTool from "./tools/transaction/FatZebraTransactionStatusTool.js";

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

// Register customer tools
server.tool(
  FatZebraCreateCustomerTool.name,
  FatZebraCreateCustomerTool.description,
  FatZebraCreateCustomerTool.schema,
  FatZebraCreateCustomerTool.execute
);

server.tool(
  FatZebraUpdateCustomerTool.name,
  FatZebraUpdateCustomerTool.description,
  FatZebraUpdateCustomerTool.schema,
  FatZebraUpdateCustomerTool.execute
);

// Register batch tools
server.tool(
  FatZebraBatchDetailsTool.name,
  FatZebraBatchDetailsTool.description,
  FatZebraBatchDetailsTool.schema,
  FatZebraBatchDetailsTool.execute
);

server.tool(
  FatZebraCreateBatchTool.name,
  FatZebraCreateBatchTool.description,
  FatZebraCreateBatchTool.schema,
  FatZebraCreateBatchTool.execute
);

server.tool(
  FatZebraListBatchesTool.name,
  FatZebraListBatchesTool.description,
  FatZebraListBatchesTool.schema,
  FatZebraListBatchesTool.execute
);

server.tool(
  FatZebraReconciliationReportTool.name,
  FatZebraReconciliationReportTool.description,
  FatZebraReconciliationReportTool.schema,
  FatZebraReconciliationReportTool.execute
);

// Register transaction tools
server.tool(
  FatZebraListTransactionsTool.name,
  FatZebraListTransactionsTool.description,
  FatZebraListTransactionsTool.schema,
  FatZebraListTransactionsTool.execute
);

server.tool(
  FatZebraSearchRefundsTool.name,
  FatZebraSearchRefundsTool.description,
  FatZebraSearchRefundsTool.schema,
  FatZebraSearchRefundsTool.execute
);

server.tool(
  FatZebraTransactionHistoryTool.name,
  FatZebraTransactionHistoryTool.description,
  FatZebraTransactionHistoryTool.schema,
  FatZebraTransactionHistoryTool.execute
);

server.tool(
  FatZebraTransactionStatusTool.name,
  FatZebraTransactionStatusTool.description,
  FatZebraTransactionStatusTool.schema,
  FatZebraTransactionStatusTool.execute
);

// Register webhook tools
server.tool(
  FatZebraCreateWebhookTool.name,
  FatZebraCreateWebhookTool.description,
  FatZebraCreateWebhookTool.schema,
  FatZebraCreateWebhookTool.execute
);

server.tool(
  FatZebraListWebhooksTool.name,
  FatZebraListWebhooksTool.description,
  FatZebraListWebhooksTool.schema,
  FatZebraListWebhooksTool.execute
);

server.tool(
  FatZebraDeleteWebhookTool.name,
  FatZebraDeleteWebhookTool.description,
  FatZebraDeleteWebhookTool.schema,
  FatZebraDeleteWebhookTool.execute
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
