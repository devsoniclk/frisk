import type { DataSource } from './base.js';
import type { Chain, OFACEntry } from '../types.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function parseOFACList(data: OFACEntry[]): Set<string> {
  return new Set(data.map(e => e.address.toLowerCase()));
}

export class OFACSource implements DataSource {
  private ethAddresses = new Set<string>();
  private solAddresses = new Set<string>();
  private entries: OFACEntry[] = [];

  constructor() {
    this.loadBundled();
  }

  private loadBundled(): void {
    try {
      const dataDir = join(__dirname, '../../data');
      const ethData: OFACEntry[] = JSON.parse(readFileSync(join(dataDir, 'ofac-eth.json'), 'utf-8'));
      const solData: OFACEntry[] = JSON.parse(readFileSync(join(dataDir, 'ofac-sol.json'), 'utf-8'));
      this.entries = [...ethData, ...solData];
      this.ethAddresses = parseOFACList(ethData);
      this.solAddresses = parseOFACList(solData);
    } catch {
      // Data files may not exist yet
    }
  }

  isMatch(address: string, chain: Chain): boolean {
    const lower = address.toLowerCase();
    if (chain === 'solana') {
      return this.solAddresses.has(lower);
    }
    return this.ethAddresses.has(lower);
  }

  refresh(): void {
    this.loadBundled();
  }

  getName(): string {
    return 'OFAC SDN';
  }

  getEntries(): OFACEntry[] {
    return this.entries;
  }

  getAddressCount(): number {
    return this.ethAddresses.size + this.solAddresses.size;
  }
}
