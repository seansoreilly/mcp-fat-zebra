import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

export default class MarkdownDocsResource {
  uri = "resource:docs/markdown";
  name = "markdown-documentation";
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
      console.log("Not running in ESM context, skipping fileURLToPath approach");
    }

    let docsDir: string | null = null;
    for (const p of possiblePaths) {
      try {
        if (fs.existsSync(p)) {
          docsDir = p;
          console.log(`Found docs directory at: ${p}`);
          break;
        }
      } catch (error) {}
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
          content: text,
          contentType: "text/markdown"
        };
      });
    } catch (error) {
      console.error(`Error reading files from ${docsDir}:`, error);
      return [];
    }
  }
}
