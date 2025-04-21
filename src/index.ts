import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Import tools
import FatZebraPassthroughTool from "./tools/FatZebraPassthroughTool.js";

// Initialize the MCP server
const server = new McpServer({
  name: "fat-zebra-server",
  version: "1.0.0"
});

// Function to register a tool
function registerTool(tool) {
  if (tool && tool.name && tool.description && tool.schema && tool.execute) {
    server.tool(
      tool.name,
      tool.description,
      tool.schema,
      tool.execute
    );
    console.log(`Registered tool: ${tool.name}`);
    return true;
  }
  return false;
}


// Import and register all resources
async function registerAllResources() {
  try {
    // Import and register resources
    const { default: MarkdownDocsResource } = await import("./resources/MarkdownDocsResource.js");
    
    // Create an instance of the resource
    const resource = new MarkdownDocsResource();
    
    // Register the resource with the server
    if (resource) {
      console.log(`Adding resource: ${resource.name}`);
      
      try {
        // Since server.resource doesn't exist, register it as a tool that returns content
        // Add debug logging
        console.log(`Registering resource as tool: ${resource.name}`);
        
        server.tool(
          resource.name,
          resource.description,
          {}, // No input schema needed
          async () => {
            try {
              const contents = await resource.read();
              console.log(`Resource read successful, found ${contents.length} items`);
              
              return {
                content: contents.map(item => ({
                  type: "text",
                  text: item.content
                }))
              };
            } catch (error) {
              console.error("Error in resource tool execution:", error);
              throw error;
            }
          }
        );
        
        console.log(`Successfully registered resource as tool: ${resource.name}`);
      } catch (error) {
        console.error(`Error registering resource: ${resource.name}`, error);
        console.warn(`Unable to register resource: ${resource.name}`);
      }
    }
    
    console.log("Resources registration attempted");
  } catch (error) {
    console.error("Error registering resources:", error);
    // Don't throw the error, just log it
    console.warn("Continuing without resources");
  }
}

// Import and register all tools
async function registerAllTools() {
  try {
    // Register the main passthrough tool
    registerTool(FatZebraPassthroughTool);
    
    // Import and register webhook tools
    const { default: FatZebraCreateWebhookTool } = await import("./tools/webhook/FatZebraCreateWebhookTool.js");
    const { default: FatZebraListWebhooksTool } = await import("./tools/webhook/FatZebraListWebhooksTool.js");
    const { default: FatZebraDeleteWebhookTool } = await import("./tools/webhook/FatZebraDeleteWebhookTool.js");
    
    registerTool(FatZebraCreateWebhookTool);
    registerTool(FatZebraListWebhooksTool);
    registerTool(FatZebraDeleteWebhookTool);
    
    // Import and register card tools
    const { default: FatZebraStoreCardTool } = await import("./tools/card/FatZebraStoreCardTool.js");
    const { default: FatZebraListStoredCardsTool } = await import("./tools/card/FatZebraListStoredCardsTool.js");
    const { default: FatZebraDeleteStoredCardTool } = await import("./tools/card/FatZebraDeleteStoredCardTool.js");
    
    registerTool(FatZebraStoreCardTool);
    registerTool(FatZebraListStoredCardsTool);
    registerTool(FatZebraDeleteStoredCardTool);
    
    // Import and register customer tools
    const { default: FatZebraCreateCustomerTool } = await import("./tools/customer/FatZebraCreateCustomerTool.js");
    const { default: FatZebraUpdateCustomerTool } = await import("./tools/customer/FatZebraUpdateCustomerTool.js");
    
    registerTool(FatZebraCreateCustomerTool);
    registerTool(FatZebraUpdateCustomerTool);
    
    // Import and register batch tools
    const { default: FatZebraBatchDetailsTool } = await import("./tools/batch/FatZebraBatchDetailsTool.js");
    const { default: FatZebraCreateBatchTool } = await import("./tools/batch/FatZebraCreateBatchTool.js");
    const { default: FatZebraListBatchesTool } = await import("./tools/batch/FatZebraListBatchesTool.js");
    const { default: FatZebraReconciliationReportTool } = await import("./tools/batch/FatZebraReconciliationReportTool.js");
    
    registerTool(FatZebraBatchDetailsTool);
    registerTool(FatZebraCreateBatchTool);
    registerTool(FatZebraListBatchesTool);
    registerTool(FatZebraReconciliationReportTool);
    
    // Import and register transaction tools
    const { default: FatZebraListTransactionsTool } = await import("./tools/transaction/FatZebraListTransactionsTool.js");
    const { default: FatZebraSearchRefundsTool } = await import("./tools/transaction/FatZebraSearchRefundsTool.js");
    const { default: FatZebraTransactionHistoryTool } = await import("./tools/transaction/FatZebraTransactionHistoryTool.js");
    const { default: FatZebraTransactionStatusTool } = await import("./tools/transaction/FatZebraTransactionStatusTool.js");
    
    registerTool(FatZebraListTransactionsTool);
    registerTool(FatZebraSearchRefundsTool);
    registerTool(FatZebraTransactionHistoryTool);
    registerTool(FatZebraTransactionStatusTool);
    
    // Import and register payment tools
    const { default: FatZebraPaymentTool } = await import("./tools/payment/FatZebraPaymentTool.js");
    const { default: FatZebraRefundTool } = await import("./tools/payment/FatZebraRefundTool.js");
    const { default: FatZebraTokenPaymentTool } = await import("./tools/payment/FatZebraTokenPaymentTool.js");
    const { default: FatZebraTokenizeTool } = await import("./tools/payment/FatZebraTokenizeTool.js");
    const { default: FatZebra3DSecureTool } = await import("./tools/payment/FatZebra3DSecureTool.js");
    const { default: FatZebraDirectDebitTool } = await import("./tools/payment/FatZebraDirectDebitTool.js");
    
    registerTool(FatZebraPaymentTool);
    registerTool(FatZebraRefundTool);
    registerTool(FatZebraTokenPaymentTool);
    registerTool(FatZebraTokenizeTool);
    registerTool(FatZebra3DSecureTool);
    registerTool(FatZebraDirectDebitTool);
    
    console.log("All tools registered successfully");
  } catch (error) {
    console.error("Error registering tools:", error);
    throw error;
  }
}

// Register all tools and resources, then start the server
Promise.all([registerAllTools(), registerAllResources()])
  .then(() => {
    // Start the server with stdio transport
    const transport = new StdioServerTransport();
    return server.connect(transport);
  })
  .then(() => {
    // console.log("Tools and resources loaded successfully.");
    // console.log("Server started successfully. Resources should be available now.");
  })
  .catch((error: Error) => {
    process.stderr.write(`[ERROR] Failed to initialize tools or start server: ${error}\n`);
  });
