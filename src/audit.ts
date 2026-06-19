import { appendFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { AuditEvent, Chain, Verdict } from './types.js';

export interface ReportOptions {
  since?: string; // e.g., '24h', '7d', '30d'
}

function parseDuration(since: string): number {
  const match = since.match(/^(\d+)([hd])$/);
  if (!match) return 24 * 60 * 60 * 1000; // default 24h
  const val = parseInt(match[1], 10);
  return match[2] === 'h' ? val * 3600_000 : val * 86400_000;
}

export class AuditLog {
  private logPath: string;

  constructor(logDir?: string) {
    const dir = logDir ?? join(process.cwd(), '.frisk');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    this.logPath = join(dir, 'audit.jsonl');
  }

  log(event: Omit<AuditEvent, 'timestamp'>): void {
    const entry: AuditEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };
    appendFileSync(this.logPath, JSON.stringify(entry) + '\n');
  }

  report(options?: ReportOptions): { total: number; blocked: number; reviewed: number; cleared: number; events: AuditEvent[] } {
    if (!existsSync(this.logPath)) {
      return { total: 0, blocked: 0, reviewed: 0, cleared: 0, events: [] };
    }

    const content = readFileSync(this.logPath, 'utf-8').trim();
    if (!content) {
      return { total: 0, blocked: 0, reviewed: 0, cleared: 0, events: [] };
    }

    let events: AuditEvent[] = content.split('\n').map(line => JSON.parse(line));

    if (options?.since) {
      const cutoff = Date.now() - parseDuration(options.since);
      events = events.filter(e => new Date(e.timestamp).getTime() >= cutoff);
    }

    return {
      total: events.length,
      blocked: events.filter(e => e.verdict.decision === 'block').length,
      reviewed: events.filter(e => e.verdict.decision === 'review').length,
      cleared: events.filter(e => e.verdict.decision === 'clear').length,
      events,
    };
  }

  getLogPath(): string {
    return this.logPath;
  }
}
