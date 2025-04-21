import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { logger, getLogger } from "./utils/logger.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Import the main passthrough tool explicitly as it's used directly
import FatZebraPassthroughTool from "./tools/FatZebraPassthroughTool.js";

// Create module-specific logger
const moduleLogger = getLogger('index');

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
    moduleLogger.info(`Registered tool: ${tool.name}`);
    return true;
  }
  return false;
}

// Function to recursively find all tool files in a directory
async function findToolFiles(dir) {
  const files = [];
  
  // Convert to absolute path if needed
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const absoluteDir = path.isAbsolute(dir) ? dir : path.join(__dirname, dir);
  
  try {
    const entries = await fs.promises.readdir(absoluteDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(absoluteDir, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively search subdirectories
        const subDirFiles = await findToolFiles(fullPath);
        files.push(...subDirFiles);
      } else if (entry.isFile() && 
                entry.name.endsWith('.js') && 
                entry.name.includes('FatZebra') && 
                entry.name.includes('Tool')) {
        // Add tool files that match the naming pattern
        files.push(fullPath);
      }
    }
  } catch (error) {
    moduleLogger.error({err: error}, `Error reading directory: ${absoluteDir}`);
  }
  
  return files;
}

// Import and register all resources
async function registerAllResources() {
  try {
    // Import and register resources
    const { default: HelpDocumentation } = await import("./resources/HelpDocumentation.js");

    // Create an instance of the resource
    const resource = new HelpDocumentation();

    // Register the resource with the server
    if (resource) {
      moduleLogger.info(`Adding resource: ${resource.name}`);

      try {
        // Since server.resource doesn't exist, register it as a tool that returns content
        moduleLogger.info(`Registering resource as tool: ${resource.name}`);

        server.tool(
          resource.name,
          resource.description,
          {}, // No input schema needed
          async () => {
            try {
              const contents = await resource.read();
              moduleLogger.info(`Resource read successful, found ${contents.length} items`);

              return {
                content: contents.map(item => ({
                  type: "text",
                  text: item.content
                }))
              };
            } catch (error) {
              moduleLogger.error({err: error}, "Error in resource tool execution");
              throw error;
            }
          }
        );

        moduleLogger.info(`Successfully registered resource as tool: ${resource.name}`);
      } catch (error) {
        moduleLogger.error({err: error}, `Error registering resource: ${resource.name}`);
        moduleLogger.warn(`Unable to register resource: ${resource.name}`);
      }
    }

    moduleLogger.info("Resources registration attempted");
  } catch (error) {
    moduleLogger.error({err: error}, "Error registering resources");
    // Don't throw the error, just log it
    moduleLogger.warn("Continuing without resources");
  }
}

// Import and register all tools
async function registerAllTools() {
  try {
    // Register the main passthrough tool first
    registerTool(FatZebraPassthroughTool);
    moduleLogger.info("Registered passthrough tool directly");
    
    // Find all tool files in the tools directory recursively
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const toolsDir = path.join(__dirname, 'tools');
    
    moduleLogger.info(`Searching for tools in directory: ${toolsDir}`);
    const toolFiles = await findToolFiles(toolsDir);
    moduleLogger.info(`Found ${toolFiles.length} potential tool files`);

    // Import and register each tool
    let successCount = 0;
    for (const file of toolFiles) {
      try {
        // Convert absolute path to relative import path
        const relativePath = path.relative(__dirname, file).replace(/\\/g, '/');
        // Skip the passthrough tool as it's already registered
        if (relativePath === 'tools/FatZebraPassthroughTool.js') {
          continue;
        }
        
        const importPath = `./${relativePath}`;
        moduleLogger.info(`Importing tool from: ${importPath}`);
        
        const module = await import(importPath);
        if (module && module.default) {
          const result = registerTool(module.default);
          if (result) {
            successCount++;
          }
        }
      } catch (error) {
        moduleLogger.error({err: error}, `Failed to import or register tool from: ${file}`);
        // Continue to the next file instead of stopping
      }
    }

    moduleLogger.info(`Successfully registered ${successCount} tools from ${toolFiles.length} files`);
  } catch (error) {
    moduleLogger.error({err: error}, "Error registering tools");
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
    moduleLogger.info("Server started successfully with all tools and resources loaded");
  })
  .catch((error) => {
    moduleLogger.error({err: error}, "Failed to initialize tools or start server");
  });
