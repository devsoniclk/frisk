import type { Chain, FlowResult } from './types.js';

export class FundFlowTracer {
  /**
   * Trace fund flows from known-illicit sources through multi-hop paths.
   *
   * **v2 STUB** — Not yet implemented. In production this will:
   * 1. Walk backward N hops from `address` using on-chain transfer events
   * 2. Cross-reference each hop against known illicit source clusters
   * 3. Return tainted paths with confidence scores
   *
   * Requires indexed archive node or subgraph access for full implementation.
   */
  async trace(_address: string, _depth: number = 3, _chain?: Chain): Promise<FlowResult> {
    throw new Error(
      'FundFlowTracer.trace() is not implemented in v1. ' +
      'Multi-hop fund tracing requires indexed archive node access. ' +
      'Expected in v2 with subgraph integration.'
    );
  }
}
