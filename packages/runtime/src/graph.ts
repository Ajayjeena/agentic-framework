/**
 * Graph node: executable step in the agent workflow.
 */
export type GraphNodeId = string;

export interface GraphNode<TState = Record<string, unknown>> {
  id: GraphNodeId;
  /** Execute the node; receives current state, returns next state and optional next node */
  execute: (state: TState) => Promise<{ state: TState; next?: GraphNodeId }>;
}

export interface GraphEdge {
  from: GraphNodeId;
  to: GraphNodeId;
  condition?: (state: Record<string, unknown>) => boolean;
}

export interface AgentGraph<TState = Record<string, unknown>> {
  nodes: Map<GraphNodeId, GraphNode<TState>>;
  edges: GraphEdge[];
  entry: GraphNodeId;
  /** Optional end node(s); when reached, execution stops */
  endNodes?: Set<GraphNodeId>;
}
