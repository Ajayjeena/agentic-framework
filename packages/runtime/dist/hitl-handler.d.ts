import type { HumanInTheLoopMode, InterceptContext, InterceptResponse } from "@agent-framework/core";
export type InterceptHandler = (context: InterceptContext) => Promise<InterceptResponse> | InterceptResponse;
export interface HumanInTheLoopOptions {
    mode: HumanInTheLoopMode;
    /** Handler called at intercept points; returns user decision */
    handler?: InterceptHandler;
    /** Webhook URL for async approval (enterprise); POST with InterceptContext, expects InterceptResponse JSON */
    webhookUrl?: string;
    /** Timeout (ms) for handler/webhook; after this, treat as "skip" */
    timeoutMs?: number;
}
//# sourceMappingURL=hitl-handler.d.ts.map