# Frisk

**Your agent is about to pay an address. Is it sanctioned? A known scam? Frisk checks before the money moves.**

Frisk is a pre-flight payment risk screen for AI agents and automated payment systems. It checks recipient addresses against sanctions lists, scores wallet risk using on-chain heuristics, and produces a clear verdict: **clear**, **review**, or **block**.

## What It Screens

| Layer | What | Sources |
|-------|------|---------|
| **Sanctions** | OFAC SDN list, community scam databases | OFAC public data, Etherscam DB, community reports |
| **Wallet Risk** | Address age, mixer interaction, dust patterns, tx frequency, scam history | On-chain heuristics (no paid API) |
| **Fund Flow** | Multi-hop tracing from known-illicit sources | *v2 — requires archive node* |

## Quickstart

```bash
# Install
npm install

# Check an address
npx frisk check 0x8589427373D6D84E98730D7795D8f6f8731FDA16 --chain ethereum

# Sync latest lists
npx frisk sync

# View audit report
npx frisk report --since 24h
```

### Programmatic Usage

```typescript
import { VerdictEngine, VerdictCache, AuditLog } from 'frisk';

const engine = new VerdictEngine();
const verdict = await engine.check({
  to: '0x...',
  amount: 100,
  token: 'USDC',
  chain: 'ethereum',
});

console.log(verdict.decision); // 'clear' | 'review' | 'block'
console.log(verdict.riskScore); // 0-100
console.log(verdict.sanctionsHit); // boolean
```

## Cerberus / Hydra Integration

Frisk is designed as a pluggable pre-flight check for the Cerberus payment agent framework:

```typescript
// In your Cerberus payment handler:
import { VerdictEngine } from 'frisk';

const frisk = new VerdictEngine();

async function beforePayment(to: string, amount: number, chain: string) {
  const verdict = await frisk.check({ to, chain });
  if (verdict.decision === 'block') {
    throw new Error(`Payment blocked: ${verdict.reasons.join(', ')}`);
  }
  if (verdict.decision === 'review') {
    // Queue for human review
    await queueForReview({ to, amount, verdict });
    return false;
  }
  return true; // proceed
}
```

## CLI Commands

```bash
# Screen an address
frisk check <address> [--chain ethereum] [--amount 10] [--token USDC]

# Refresh data sources
frisk sync

# Audit report
frisk report [--since 24h|7d|30d]
```

## Architecture

```
Input (address + chain)
  │
  ├─► SanctionsScreener ──► OFACSource + CommunitySource
  │
  ├─► WalletRiskScorer ──► 5 heuristic factors (0-100)
  │
  └─► VerdictEngine ──► Decision: clear | review | block
        │
        ├─► VerdictCache (TTL-based)
        └─► AuditLog (append-only JSONL)
```

## Verdict Logic

| Condition | Decision |
|-----------|----------|
| Sanctions hit (OFAC or community) | 🚫 **block** |
| Risk score > 70 | 🚫 **block** |
| Risk score > 40 | ⚠️ **review** |
| Otherwise | ✅ **clear** |

Thresholds are configurable:
```typescript
const engine = new VerdictEngine({ blockThreshold: 80, reviewThreshold: 50 });
```

## Data Sources

- **OFAC SDN**: Bundled sample of known sanctioned crypto addresses (Tornado Cash, Lazarus Group, etc.)
- **Community Scam DB**: Community-reported scam, phishing, mixer, and ransomware addresses
- **Extensible**: Add your own sources by implementing the `DataSource` interface

## Roadmap

- [x] v0.1 — Sanctions screening + wallet risk heuristics + CLI
- [ ] v0.2 — Fund-flow multi-hop tracing (archive node / subgraph)
- [ ] v0.3 — OFAC live refresh (auto-download from Treasury API)
- [ ] v0.4 — Chainalysis/Elliptic API integration (optional paid layer)
- [ ] v0.5 — Hydra plugin for autonomous agent payment gates
- [ ] v1.0 — Production-ready with full test coverage and CI

## ⚖️ COMPLIANCE DISCLAIMER

**Frisk is a screening aid, not legal advice.** It provides automated pre-flight risk assessments based on publicly available data and on-chain heuristics. It does NOT:

- Replace formal compliance review by qualified legal counsel
- Guarantee detection of all sanctioned or illicit addresses
- Constitute legal advice or a compliance certification
- Satisfy regulatory requirements for money transmission or financial services

Users are responsible for ensuring their own regulatory compliance. Frisk is a tool to assist — not replace — proper compliance processes. Always consult qualified legal counsel for compliance decisions.

## License

MIT — see [LICENSE](./LICENSE)
