# frisk

Pre-flight payment risk screening for AI agents.

Before your agent pays an address, frisk checks it: OFAC sanctions list, community scam databases, on-chain heuristics (address age, mixer interaction, dust patterns). You get back a verdict — `clear`, `review`, or `block` — before any money moves.

```bash
npm install
```

```typescript
import { VerdictEngine } from 'frisk';

const engine = new VerdictEngine();
const verdict = await engine.check({
  to: '0xRecipient...',
  amount: 100,
  token: 'USDC',
  chain: 'ethereum',
});

console.log(verdict.decision);    // 'clear' | 'review' | 'block'
console.log(verdict.riskScore);   // 0-100
console.log(verdict.sanctionsHit); // boolean
console.log(verdict.reasons);     // string[]
```

## CLI

```bash
# check an address
npx frisk check 0x8589427373D6D84E98730D7795D8f6f8731FDA16 --chain ethereum

# refresh local data sources
npx frisk sync

# audit log
npx frisk report --since 24h
```

## Verdict logic

Sanctions hit → block, no further checks. Risk score > 70 → block. Score > 40 → review. Otherwise clear.

Thresholds are configurable:
```typescript
const engine = new VerdictEngine({ blockThreshold: 80, reviewThreshold: 50 });
```

## What it screens

**Sanctions.** Bundled OFAC SDN sample (Tornado Cash, Lazarus Group, etc.) plus community-reported addresses. Not a live feed — run `frisk sync` to refresh.

**Wallet risk.** Five on-chain heuristics: address age, known mixer interaction, dust transaction patterns, tx frequency anomalies, scam history flags. Scored 0–100. No paid API required.

**Fund flow tracing.** Multi-hop tracing from known-illicit sources is planned for v2 — requires an archive node. Not in the current release.

## Cerberus integration

Frisk works as a pluggable pre-flight check inside a Cerberus payment handler:

```typescript
import { VerdictEngine } from 'frisk';
const frisk = new VerdictEngine();

async function beforePayment(to: string, amount: number, chain: string) {
  const verdict = await frisk.check({ to, chain });
  if (verdict.decision === 'block') {
    throw new Error(`Payment blocked: ${verdict.reasons.join(', ')}`);
  }
  if (verdict.decision === 'review') {
    await queueForReview({ to, amount, verdict });
    return false;
  }
  return true;
}
```

## Data sources

OFAC SDN and community scam DB are bundled. Add your own by implementing the `DataSource` interface.

---

**Compliance note.** Frisk is a screening aid. It doesn't replace legal compliance review, doesn't guarantee detection of all sanctioned addresses, and doesn't constitute legal advice. If you're building something that needs formal compliance certification, talk to a lawyer.

## License

MIT
