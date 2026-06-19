#!/usr/bin/env node

import { Command } from 'commander';
import { VerdictEngine } from './verdict.js';
import { SanctionsScreener } from './sanctions.js';
import { AuditLog } from './audit.js';
import type { Chain } from './types.js';

const program = new Command();

program
  .name('frisk')
  .description('Payment risk pre-flight: sanctions + wallet risk screening')
  .version('0.1.0');

program
  .command('check')
  .description('Screen an address before payment')
  .argument('<address>', 'Recipient address')
  .option('-c, --chain <chain>', 'Chain (ethereum, base, solana, etc.)', 'ethereum')
  .option('-a, --amount <amount>', 'Payment amount')
  .option('-t, --token <token>', 'Token symbol')
  .action(async (address: string, opts: { chain: string; amount?: string; token?: string }) => {
    const engine = new VerdictEngine();
    const audit = new AuditLog();
    const chain = opts.chain as Chain;

    console.log(`\n🔍 Frisking ${address} on ${chain}...\n`);

    const verdict = await engine.check({
      to: address,
      amount: opts.amount ? parseFloat(opts.amount) : undefined,
      token: opts.token,
      chain,
    });

    const icon = verdict.decision === 'block' ? '🚫' : verdict.decision === 'review' ? '⚠️' : '✅';
    const label = verdict.decision.toUpperCase();

    console.log(`${icon} Decision: ${label}`);
    console.log(`   Risk Score: ${verdict.riskScore}/100`);
    console.log(`   Sanctions Hit: ${verdict.sanctionsHit ? 'YES' : 'no'}`);

    if (verdict.reasons.length > 0) {
      console.log('\n   Reasons:');
      for (const r of verdict.reasons) {
        console.log(`   • ${r}`);
      }
    }

    console.log();

    // Log to audit
    audit.log({
      address,
      chain,
      verdict,
      reasons: verdict.reasons,
    });

    process.exitCode = verdict.decision === 'block' ? 1 : 0;
  });

program
  .command('sync')
  .description('Refresh sanctions and scam lists')
  .action(() => {
    console.log('🔄 Syncing sanctions and scam lists...');
    const screener = new SanctionsScreener();
    screener.refresh();
    const stats = screener.getStats();
    console.log(`   OFAC addresses loaded: ${stats.ofacCount}`);
    console.log(`   Community scam addresses loaded: ${stats.communityCount}`);
    console.log('✅ Sync complete.\n');
  });

program
  .command('report')
  .description('Show audit summary')
  .option('-s, --since <period>', 'Time period (e.g., 24h, 7d)', '24h')
  .action((opts: { since: string }) => {
    const audit = new AuditLog();
    const report = audit.report({ since: opts.since });

    console.log(`\n📊 Frisk Audit Report (last ${opts.since})\n`);
    console.log(`   Total checks: ${report.total}`);
    console.log(`   ✅ Cleared:    ${report.cleared}`);
    console.log(`   ⚠️  Reviewed:   ${report.reviewed}`);
    console.log(`   🚫 Blocked:    ${report.blocked}`);

    if (report.total > 0) {
      const blockRate = ((report.blocked / report.total) * 100).toFixed(1);
      console.log(`   Block rate:    ${blockRate}%`);
    }
    console.log();
  });

program.parse();
