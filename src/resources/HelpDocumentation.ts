import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { getLogger } from "../utils/logger.js";

// Create resource-specific logger
const logger = getLogger('HelpDocumentation');

export default class HelpDocumentation {
  uri = "resource:docs/markdown";
  name = "fat_zebra_help_documentation";
  description = "Understand this documentation BEFORE using Fat Zebra tools.";
  contentType = "text/markdown";

  async read(): Promise<{ uri: string; content: string; contentType: string }[]> {
    const possiblePaths = [
      path.resolve(process.cwd(), "docs"),
      path.resolve(process.cwd(), "src", "../docs"),
      path.resolve(process.cwd(), "dist", "../docs"),
    ];

    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      possiblePaths.push(path.resolve(__dirname, "../../docs"));
    } catch (error) {
      logger.info("Not running in ESM context, skipping fileURLToPath approach");
    }

    let docsDir: string | null = null;
    for (const p of possiblePaths) {
      try {
        if (fs.existsSync(p)) {
          docsDir = p;
          logger.info({ path: p }, "Found docs directory");
          break;
        }
      } catch (error) {}
    }

    if (!docsDir) {
      logger.error({ paths: possiblePaths }, "Could not find docs directory");
      return [];
    }

    try {
      const files = fs.readdirSync(docsDir);
      const markdownFiles = files.filter(f => f.endsWith(".md"));
      logger.info({ count: markdownFiles.length, directory: docsDir }, "Found markdown files");

      return markdownFiles.map(filename => {
        const filePath = path.join(docsDir!, filename);
        const text = fs.readFileSync(filePath, "utf-8");
        return {
          uri: `resource:docs/markdown/${filename}`,
          content: text,
          contentType: "text/markdown"
        };
      });
    } catch (error) {
      logger.error({ err: error, directory: docsDir }, "Error reading files");
      return [];
    }
  }
}
