/**
 * File connector: load documents from local files (txt, md).
 */
import * as fs from "fs";
import * as path from "path";
import type { Document } from "../types.js";
import type { DataConnector } from "../connector.js";

export interface FileConnectorOptions {
  /** Path to file or directory */
  path: string;
  /** Supported extensions; default [".txt", ".md"] */
  extensions?: string[];
  /** Charset; default "utf-8" */
  encoding?: BufferEncoding;
}

/**
 * Load documents from a single file or directory of text files.
 */
export class FileConnector implements DataConnector {
  constructor(private options: FileConnectorOptions) {}

  async load(): Promise<Document[]> {
    const { path: basePath, extensions = [".txt", ".md"], encoding = "utf-8" } = this.options;
    const stat = await fs.promises.stat(basePath);
    const docs: Document[] = [];

    if (stat.isFile()) {
      const content = await fs.promises.readFile(basePath, encoding);
      const ext = path.extname(basePath);
      if (extensions.includes(ext) || extensions.length === 0) {
        docs.push({
          id: basePath,
          content: content.toString(),
          metadata: { path: basePath },
          source: basePath,
        });
      }
    } else if (stat.isDirectory()) {
      const entries = await fs.promises.readdir(basePath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(basePath, entry.name);
        if (entry.isDirectory()) {
          const subConnector = new FileConnector({
            ...this.options,
            path: fullPath,
          });
          docs.push(...(await subConnector.load()));
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (extensions.includes(ext)) {
            const content = await fs.promises.readFile(fullPath, encoding);
            docs.push({
              id: fullPath,
              content: content.toString(),
              metadata: { path: fullPath },
              source: fullPath,
            });
          }
        }
      }
    }
    return docs;
  }
}
