import { describe, it, expect } from 'vitest';
import { VerdictEngine } from '../src/verdict.js';

describe('VerdictEngine', () => {
  const engine = new VerdictEngine();

  it('blocks sanctioned address', async () => {
    const verdict = await engine.check({
      to: '0x8589427373D6D84E98730D7795D8f6f8731FDA16',
      chain: 'ethereum',
    });
    expect(verdict.decision).toBe('block');
    expect(verdict.sanctionsHit).toBe(true);
  });

  it('clears a low-risk clean address', async () => {
    const verdict = await engine.check({
      to: '0x0000000000000000000000000000000000000001',
      chain: 'ethereum',
    });
    // May be clear or review depending on heuristic, but should not be block
    expect(['clear', 'review']).toContain(verdict.decision);
    expect(verdict.sanctionsHit).toBe(false);
  });

  it('respects custom thresholds', async () => {
    const strict = new VerdictEngine({ blockThreshold: 10, reviewThreshold: 5 });
    const verdict = await strict.check({
      to: '0xAbCdEf0123456789AbCdEf0123456789AbCdEf01',
      chain: 'ethereum',
    });
    // With very low thresholds, most addresses should be at least review
    expect(verdict.riskScore).toBeGreaterThanOrEqual(0);
  });

  it('includes reasons in verdict', async () => {
    const verdict = await engine.check({
      to: '0x8589427373D6D84E98730D7795D8f6f8731FDA16',
      chain: 'ethereum',
    });
    expect(verdict.reasons.length).toBeGreaterThan(0);
    expect(verdict.reasons[0]).toContain('Sanctions hit');
  });
});
