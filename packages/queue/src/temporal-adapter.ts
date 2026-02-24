/**
 * Optional Temporal adapter: workflow orchestration for long-running agent tasks.
 * Requires @temporalio/client and worker setup; use for exactly-once, durable workflows.
 */
export interface TemporalWorkflowInput {
  workflowId: string;
  taskQueue: string;
  args: unknown[];
}

export interface TemporalAdapter {
  /** Start a workflow (client must be configured externally) */
  startWorkflow?(input: TemporalWorkflowInput): Promise<string>;
}
