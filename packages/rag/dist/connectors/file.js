/**
 * File connector: load documents from local files (txt, md).
 */
import * as fs from "fs";
import * as path from "path";
/**
 * Load documents from a single file or directory of text files.
 */
export class FileConnector {
    options;
    constructor(options) {
        this.options = options;
    }
    async load() {
        const { path: basePath, extensions = [".txt", ".md"], encoding = "utf-8" } = this.options;
        const stat = await fs.promises.stat(basePath);
        const docs = [];
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
        }
        else if (stat.isDirectory()) {
            const entries = await fs.promises.readdir(basePath, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(basePath, entry.name);
                if (entry.isDirectory()) {
                    const subConnector = new FileConnector({
                        ...this.options,
                        path: fullPath,
                    });
                    docs.push(...(await subConnector.load()));
                }
                else if (entry.isFile()) {
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
//# sourceMappingURL=file.js.map