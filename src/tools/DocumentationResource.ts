import { MCPResource } from "mcp-framework";
import * as fs from "fs";
import * as path from "path";

class DocumentationResource extends MCPResource {
  uri = "documentation://";
  name = "documentation";
  description = "Documentation for Fat Zebra payment processing, including test card numbers and integration guides.";
  mimeType = "text/markdown";

  async read(): Promise<{ uri: string; mimeType?: string; text?: string; blob?: string }[]> {
    try {
      const docsDir = path.join(process.cwd(), "docs");
      
      if (!fs.existsSync(docsDir)) {
        return [];
      }
      
      // Get the test-card-numbers.md file
      const testCardNumbersPath = path.join(docsDir, "test-card-numbers.md");
      
      if (!fs.existsSync(testCardNumbersPath)) {
        return [];
      }
      
      // Read the file content
      const content = fs.readFileSync(testCardNumbersPath, "utf-8");
      
      // Return the content in the required format
      return [
        {
          uri: `${this.uri}test-card-numbers.md`,
          mimeType: this.mimeType,
          text: content
        }
      ];
    } catch (error) {
      console.error(`Error reading documentation: ${error}`);
      return [];
    }
  }

  // Implementation of list method to list available documentation
  async list(relativePath: string): Promise<{ name: string; type: string; displayName?: string }[]> {
    try {
      const docsDir = path.join(process.cwd(), "docs");
      // If a specific subdirectory is requested, update the path
      const targetDir = relativePath ? path.join(docsDir, relativePath) : docsDir;
      
      if (!fs.existsSync(targetDir)) {
        return [];
      }
      
      // Read directory contents
      const items = fs.readdirSync(targetDir, { withFileTypes: true });
      
      // Map directory entries to the expected format
      return items.map(item => ({
        name: item.name,
        type: item.isDirectory() ? "directory" : "file",
        displayName: item.name.replace(/-/g, " ").replace(/\.md$/, "")
      }));
    } catch (error) {
      console.error(`Error listing documentation: ${error}`);
      return [];
    }
  }
}

export default DocumentationResource; 