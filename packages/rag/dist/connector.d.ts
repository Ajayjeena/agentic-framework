/**
 * Data connector: load documents from sources (file, API, etc.).
 */
import type { Document } from "./types.js";
export interface DataConnector {
    /** Load documents from the source */
    load(): Promise<Document[]>;
    /** Optional: incremental load (e.g. since last sync) */
    loadIncremental?(since?: string): Promise<Document[]>;
}
//# sourceMappingURL=connector.d.ts.map