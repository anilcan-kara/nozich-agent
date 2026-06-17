# Langfuse Observability Plugin

This plugin ships bundled with Nozich but is **opt-in** — it only loads when
you explicitly enable it.

## Enable

Pick one:

```bash
# Interactive: walks you through credentials + SDK install + enable
nozich tools  # → Langfuse Observability

# Manual
pip install langfuse
nozich plugins enable observability/langfuse
```

## Required credentials

Set these in `~/.nozich/.env` (or via `nozich tools`):

```bash
NOZICH_LANGFUSE_PUBLIC_KEY=pk-lf-...
NOZICH_LANGFUSE_SECRET_KEY=sk-lf-...
NOZICH_LANGFUSE_BASE_URL=https://cloud.langfuse.com   # or your self-hosted URL
```

Without the SDK or credentials the hooks no-op silently — the plugin fails
open.

## Verify

```bash
nozich plugins list                 # observability/langfuse should show "enabled"
nozich chat -q "hello"              # then check Langfuse for a "Nozich turn" trace
```

## Optional tuning

```bash
NOZICH_LANGFUSE_ENV=production       # environment tag
NOZICH_LANGFUSE_RELEASE=v1.0.0       # release tag
NOZICH_LANGFUSE_SAMPLE_RATE=0.5      # sample 50% of traces
NOZICH_LANGFUSE_MAX_CHARS=12000      # max chars per field (default: 12000)
NOZICH_LANGFUSE_DEBUG=true           # verbose plugin logging
```

## Disable

```bash
nozich plugins disable observability/langfuse
```
