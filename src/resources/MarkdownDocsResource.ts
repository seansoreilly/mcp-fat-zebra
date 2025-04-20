import { MCPResource, ResourceContent } from "mcp-framework";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

export default class DocumentationResource extends MCPResource {
  uri = "resource:docs/markdown";
  name = "Markdown Documentation";
  description = "Understand this documentation BEFORE using Fat Zebra tools.";
  mimeType = "text/markdown";

  constructor() {
    super();
  }

  async read(): Promise<ResourceContent[]> {

    // Try multiple approaches to find the docs directory
    const possiblePaths = [
      // From project root
      path.resolve(process.cwd(), "docs"),
      // From source directory
      path.resolve(process.cwd(), "src", "../docs"),
      // From dist directory
      path.resolve(process.cwd(), "dist", "../docs"),
    ];
    
    // If running in ESM context
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      possiblePaths.push(path.resolve(__dirname, "../../docs"));
    } catch (error) {
      console.log("Not running in ESM context, skipping fileURLToPath approach");
    }
    
    // Find the first valid path
    let docsDir: string | null = null;
    for (const p of possiblePaths) {
      try {
        if (fs.existsSync(p)) {
          docsDir = p;
          console.log(`Found docs directory at: ${p}`);
          break;
        }
      } catch (error) {
        // Continue trying other paths
      }
    }
    
    if (!docsDir) {
      console.error("Could not find docs directory. Tried:", possiblePaths);
      return [];
    }
    
    try {
      const files = fs.readdirSync(docsDir);
      const markdownFiles = files.filter(f => f.endsWith(".md"));
      console.log(`Found ${markdownFiles.length} markdown files in ${docsDir}`);
      
      return markdownFiles.map(filename => {
        const filePath = path.join(docsDir!, filename);
        const text = fs.readFileSync(filePath, "utf-8");
        return {
          uri: `resource:docs/markdown/${filename}`,
          mimeType: "text/markdown",
          text,
        };
      });
    } catch (error) {
      console.error(`Error reading files from ${docsDir}:`, error);
      return [];
    }
  }
} 