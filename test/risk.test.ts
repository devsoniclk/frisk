import { describe, it, expect } from 'vitest';
import { WalletRiskScorer } from '../src/risk.js';

describe('WalletRiskScorer', () => {
  const scorer = new WalletRiskScorer();

  it('scores a mixer address high on mixer factor', async () => {
    const result = await scorer.score('0xd90e2f925da726b50c4ed8d0fb90ad053324f31b', 'ethereum');
    const mixerFactor = result.factors.find(f => f.name === 'Mixer Interaction');
    expect(mixerFactor?.score).toBe(100);
    expect(mixerFactor?.contribution).toBeGreaterThan(0);
  });

  it('returns factors with weights summing to ~1', async () => {
    const result = await scorer.score('0x0000000000000000000000000000000000000001', 'ethereum');
    const totalWeight = result.factors.reduce((sum, f) => sum + f.weight, 0);
    expect(totalWeight).toBeCloseTo(1.0, 2);
  });

  it('returns score in 0-100 range', async () => {
    const result = await scorer.score('0xAbCdEf0123456789AbCdEf0123456789AbCdEf01', 'ethereum');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('returns 5 named factors', async () => {
    const result = await scorer.score('0x1111111111111111111111111111111111111111', 'ethereum');
    expect(result.factors).toHaveLength(5);
    const names = result.factors.map(f => f.name);
    expect(names).toContain('Address Age');
    expect(names).toContain('Mixer Interaction');
    expect(names).toContain('Dust Attack Pattern');
    expect(names).toContain('Transaction Frequency');
    expect(names).toContain('Scam History');
  });
});
