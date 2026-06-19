import { describe, it, expect } from 'vitest';
import { SanctionsScreener } from '../src/sanctions.js';

describe('SanctionsScreener', () => {
  const screener = new SanctionsScreener();

  it('detects OFAC-sanctioned ETH address', async () => {
    const result = await screener.check('0x8589427373D6D84E98730D7795D8f6f8731FDA16', 'ethereum');
    expect(result.screened).toBe(true);
    expect(result.hit).toBe(true);
    expect(result.list).toBe('OFAC SDN');
    expect(result.reason).toContain('Tornado Cash');
  });

  it('detects OFAC address case-insensitively', async () => {
    const result = await screener.check('0x8589427373d6d84e98730d7795d8f6f8731fda16', 'ethereum');
    expect(result.hit).toBe(true);
  });

  it('detects community scam address', async () => {
    const result = await screener.check('0xdead000000000000000000000000000000000000', 'ethereum');
    expect(result.screened).toBe(true);
    expect(result.hit).toBe(true);
    expect(result.list).toBe('Community');
    expect(result.reason).toContain('ransomware');
  });

  it('returns no hit for clean address', async () => {
    const result = await screener.check('0x0000000000000000000000000000000000000001', 'ethereum');
    expect(result.screened).toBe(true);
    expect(result.hit).toBe(false);
  });

  it('returns stats', () => {
    const stats = screener.getStats();
    expect(stats.ofacCount).toBeGreaterThan(0);
    expect(stats.communityCount).toBeGreaterThan(0);
  });
});
