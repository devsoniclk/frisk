/**
 * Example: Using Frisk with Cerberus payment agent integration
 *
 * This demonstrates how an AI payment agent would use Frisk
 * as a pre-flight check before executing a payment.
 */

import { VerdictEngine, VerdictCache, AuditLog, FundFlowTracer } from '../src/index.js';
import type { Chain } from '../src/index.js';

interface PaymentRequest {
  to: string;
  amount: number;
  token: string;
  chain: Chain;
}

async function safePay(request: PaymentRequest): Promise<{ proceed: boolean; reason: string }> {
  const engine = new VerdictEngine();
  const cache = new VerdictCache();
  const audit = new AuditLog();
  const flow = new FundFlowTracer();

  // 1. Check cache first
  const cached = cache.get(request.to);
  if (cached) {
    console.log(`Cache hit for ${request.to}: ${cached.decision}`);
    return {
      proceed: cached.decision === 'clear',
      reason: cached.decision === 'clear' ? 'Cached: previously cleared' : `Cached: ${cached.decision}`,
    };
  }

  // 2. Run full verdict check
  console.log(`\n🔍 Running Frisk check on ${request.to}...`);
  const verdict = await engine.check(request);

  // 3. Cache the result (1 hour TTL)
  cache.set(request.to, verdict, 3600_000);

  // 4. Log to audit trail
  audit.log({
    address: request.to,
    chain: request.chain,
    verdict,
    reasons: verdict.reasons,
  });

  // 5. (v2) Optional fund-flow tracing
  try {
    const flowResult = await flow.trace(request.to, 3, request.chain);
    console.log(`   Fund flow: ${flowResult.taintedPaths} tainted paths found`);
  } catch {
    // Flow tracing not available in v1
  }

  // 6. Decision
  const icon = verdict.decision === 'block' ? '🚫' : verdict.decision === 'review' ? '⚠️' : '✅';
  console.log(`${icon} Verdict: ${verdict.decision.toUpperCase()} (risk: ${verdict.riskScore}/100)`);

  return {
    proceed: verdict.decision === 'clear',
    reason: verdict.decision === 'clear'
      ? `Payment approved — risk score ${verdict.riskScore}/100`
      : `Payment ${verdict.decision}: ${verdict.reasons.join('; ')}`,
  };
}

// Example usage
async function main() {
  const requests: PaymentRequest[] = [
    { to: '0x8589427373D6D84E98730D7795D8f6f8731FDA16', amount: 100, token: 'USDC', chain: 'ethereum' },
    { to: '0xAbCdEf0123456789AbCdEf0123456789AbCdEf01', amount: 50, token: 'USDC', chain: 'base' },
    { to: '0x0000000000000000000000000000000000000001', amount: 10, token: 'ETH', chain: 'ethereum' },
  ];

  console.log('=== Frisk + Cerberus Integration Example ===\n');

  for (const req of requests) {
    const result = await safePay(req);
    console.log(`   ${result.proceed ? '✅ PROCEED' : '🛑 BLOCKED'}: ${result.reason}\n`);
  }
}

main().catch(console.error);
