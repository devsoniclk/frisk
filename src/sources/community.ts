import type { DataSource } from './base.js';
import type { Chain, CommunityEntry } from '../types.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class CommunitySource implements DataSource {
  private entries: CommunityEntry[] = [];
  private addressMap = new Map<string, CommunityEntry>();

  constructor() {
    this.loadBundled();
  }

  private loadBundled(): void {
    try {
      const dataDir = join(__dirname, '../../data');
      this.entries = JSON.parse(readFileSync(join(dataDir, 'community-scams.json'), 'utf-8'));
      this.addressMap.clear();
      for (const entry of this.entries) {
        this.addressMap.set(entry.address.toLowerCase(), entry);
      }
    } catch {
      // Data files may not exist yet
    }
  }

  isMatch(address: string, chain: Chain): boolean {
    const entry = this.addressMap.get(address.toLowerCase());
    if (!entry) return false;
    // Match if chain matches or entry is chain-agnostic
    return entry.chain === chain || entry.chain === 'all';
  }

  getMatch(address: string): CommunityEntry | undefined {
    return this.addressMap.get(address.toLowerCase());
  }

  refresh(): void {
    this.loadBundled();
  }

  getName(): string {
    return 'Community Scam DB';
  }

  getEntries(): CommunityEntry[] {
    return this.entries;
  }

  getAddressCount(): number {
    return this.addressMap.size;
  }
}
