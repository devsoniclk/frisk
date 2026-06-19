export type Chain = 'ethereum' | 'base' | 'arbitrum' | 'optimism' | 'polygon' | 'solana';

export interface SanctionsResult {
  screened: boolean;
  hit: boolean;
  list?: string;
  reason?: string;
}

export interface RiskFactor {
  name: string;
  score: number;
  weight: number;
  contribution: number;
  detail: string;
}

export interface RiskScore {
  score: number;
  factors: RiskFactor[];
}

export type Decision = 'clear' | 'review' | 'block';

export interface Verdict {
  decision: Decision;
  reasons: string[];
  riskScore: number;
  sanctionsHit: boolean;
}

export interface AuditEvent {
  timestamp: string;
  address: string;
  chain: Chain;
  verdict: Verdict;
  reasons: string[];
}

export interface FlowResult {
  hops: number;
  taintedPaths: number;
  sources: string[];
}

export interface CommunityEntry {
  address: string;
  chain: string;
  category: string;
  source: string;
  added_date: string;
}

export interface OFACEntry {
  address: string;
  name: string;
  added: string;
  reason: string;
}
