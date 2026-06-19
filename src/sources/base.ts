import type { Chain } from '../types.js';

export interface DataSource {
  isMatch(address: string, chain: Chain): boolean;
  refresh(): void;
  getName(): string;
}
