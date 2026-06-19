import type { Chain, Decision, Verdict } from './types.js';
import { SanctionsScreener } from './sanctions.js';
import { WalletRiskScorer } from './risk.js';

export interface VerdictConfig {
  blockThreshold: number;
  reviewThreshold: number;
}

const DEFAULT_CONFIG: VerdictConfig = {
  blockThreshold: 70,
  reviewThreshold: 40,
};

export interface CheckParams {
  to: string;
  amount?: number;
  token?: string;
  chain: Chain;
}

export class VerdictEngine {
  private sanctions: SanctionsScreener;
  private riskScorer: WalletRiskScorer;
  private config: VerdictConfig;

  constructor(config?: Partial<VerdictConfig>) {
    this.sanctions = new SanctionsScreener();
    this.riskScorer = new WalletRiskScorer();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async check({ to, chain }: CheckParams): Promise<Verdict> {
    const reasons: string[] = [];
    let sanctionsHit = false;

    // Sanctions screening
    const sanctionsResult = await this.sanctions.check(to, chain);
    if (sanctionsResult.hit) {
      sanctionsHit = true;
      reasons.push(`Sanctions hit: [${sanctionsResult.list}] ${sanctionsResult.reason}`);
    }

    // Risk scoring
    const riskResult = await this.riskScorer.score(to, chain);
    for (const factor of riskResult.factors) {
      if (factor.score > 50) {
        reasons.push(`Risk factor [${factor.name}]: ${factor.detail} (score: ${factor.score})`);
      }
    }

    // Decision logic
    let decision: Decision = 'clear';
    if (sanctionsHit) {
      decision = 'block';
    } else if (riskResult.score > this.config.blockThreshold) {
      decision = 'block';
      reasons.unshift(`Risk score ${riskResult.score} exceeds block threshold ${this.config.blockThreshold}`);
    } else if (riskResult.score > this.config.reviewThreshold) {
      decision = 'review';
      reasons.unshift(`Risk score ${riskResult.score} exceeds review threshold ${this.config.reviewThreshold}`);
    }

    return {
      decision,
      reasons,
      riskScore: riskResult.score,
      sanctionsHit,
    };
  }

  refresh(): void {
    this.sanctions.refresh();
  }
}
