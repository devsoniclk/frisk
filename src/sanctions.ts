import type { Chain, SanctionsResult } from './types.js';
import { OFACSource } from './sources/ofac.js';
import { CommunitySource } from './sources/community.js';

export class SanctionsScreener {
  private ofac: OFACSource;
  private community: CommunitySource;

  constructor() {
    this.ofac = new OFACSource();
    this.community = new CommunitySource();
  }

  async check(address: string, chain: Chain): Promise<SanctionsResult> {
    const normalized = address.toLowerCase();

    // Check OFAC first (higher priority)
    if (this.ofac.isMatch(normalized, chain)) {
      const entry = this.ofac.getEntries().find(e => e.address.toLowerCase() === normalized);
      return {
        screened: true,
        hit: true,
        list: 'OFAC SDN',
        reason: entry?.reason ?? 'Listed on OFAC SDN list',
      };
    }

    // Check community scam database
    if (this.community.isMatch(normalized, chain)) {
      const match = this.community.getMatch(normalized);
      return {
        screened: true,
        hit: true,
        list: 'Community',
        reason: `Category: ${match?.category ?? 'unknown'} (source: ${match?.source ?? 'unknown'})`,
      };
    }

    return { screened: true, hit: false };
  }

  refresh(): void {
    this.ofac.refresh();
    this.community.refresh();
  }

  getStats(): { ofacCount: number; communityCount: number } {
    return {
      ofacCount: this.ofac.getAddressCount(),
      communityCount: this.community.getAddressCount(),
    };
  }
}
