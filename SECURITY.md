# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Frisk, please report it responsibly:

1. **Do NOT open a public GitHub issue** for security vulnerabilities
2. Email security concerns to the maintainers directly
3. Include a description of the vulnerability, steps to reproduce, and potential impact
4. We will acknowledge receipt within 48 hours and provide a fix timeline

## Scope

Frisk handles sensitive compliance data. The following are considered in-scope:

- Data poisoning attacks on bundled sanctions/scam lists
- Cache poisoning that could cause a sanctioned address to be marked clear
- Audit log tampering or bypass
- Injection attacks via address inputs
- Information leakage from cached verdicts or audit logs

## Security Considerations

- **Data Integrity**: Sanctions lists are bundled at build time. Always run `frisk sync` to refresh.
- **Cache Poisoning**: Cached verdicts have TTL expiry. Lower TTL for high-risk environments.
- **Audit Trail**: Audit logs are append-only JSONL. Protect the `.frisk/` directory permissions.
- **No Private Keys**: Frisk never handles, stores, or transmits private keys.

## Best Practices

1. Run `frisk sync` regularly to keep sanctions lists current
2. Set appropriate cache TTLs for your risk tolerance
3. Monitor audit logs for unusual patterns
4. Use Frisk as ONE layer in a defense-in-depth compliance strategy
5. Never rely solely on automated screening for high-value transactions
