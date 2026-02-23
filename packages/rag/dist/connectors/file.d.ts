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
export declare class FileConnector implements DataConnector {
    private options;
    constructor(options: FileConnectorOptions);
    load(): Promise<Document[]>;
}
//# sourceMappingURL=file.d.ts.map