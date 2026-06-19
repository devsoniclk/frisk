# Contributing to Frisk

Thank you for your interest in contributing to Frisk!

## Getting Started

```bash
git clone <repo-url>
cd frisk
npm install
npm test
```

## Development

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type check
npm run lint

# Build
npm run build

# Run CLI in dev mode
npm run dev -- check 0x... --chain ethereum
```

## Project Structure

```
src/
├── index.ts          # Public API exports
├── sanctions.ts      # Sanctions screening engine
├── risk.ts           # Wallet risk scoring heuristics
├── flow.ts           # Fund flow tracing (v2)
├── verdict.ts        # Verdict decision engine
├── cache.ts          # TTL-based verdict cache
├── audit.ts          # JSONL audit logging
├── cli.ts            # CLI interface
├── types.ts          # Shared types
└── sources/          # Data source implementations
    ├── base.ts       # Abstract DataSource interface
    ├── ofac.ts       # OFAC SDN list parser
    └── community.ts  # Community scam database
```

## Adding a New Data Source

1. Create `src/sources/my-source.ts` implementing `DataSource`
2. Add the source to `SanctionsScreener` in `src/sanctions.ts`
3. Export from `src/sources/index.ts`
4. Add tests

## Adding New Risk Heuristics

1. Add a new `HeuristicCheck` in `src/risk.ts`
2. Add it to the `HEURISTICS` array
3. Ensure weights still sum to ~1.0
4. Add test coverage

## Pull Request Guidelines

- One feature/fix per PR
- Include tests for new functionality
- Update README if adding public API
- Ensure `npm run lint` passes
- Keep commit messages clear and descriptive

## Code Style

- TypeScript strict mode
- ESM modules
- Prefer `async/await` over raw promises
- Use explicit return types on public methods
