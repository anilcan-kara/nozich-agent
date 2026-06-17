"""Centralized Nous Portal request tags.

Every Nozich request that hits the Nous Portal — main agent loop, auxiliary
client (compression / titles / vision / web_extract / session_search / etc.),
and any future code path — must carry the same product-attribution tags so
Nous can attribute usage to Nozich Agent and bucket it by client release.

Tag shape (sent in OpenAI-compatible ``extra_body['tags']``):

    [
        "product=nozich-agent",
        "client=nozich-client-v<__version__>",
    ]

The version is sourced live from ``nozich_cli.__version__`` so it auto-aligns
to whatever release is installed; the release script
(``scripts/release.py``) regex-bumps that single string, and every Portal
request picks up the new tag on the next process start.

Why one helper instead of inlining the literal at each site:
* Four call sites (main loop profile, aux client, run_agent compression
  fallback, web_tools fallback) used to drift apart — see PR #24194 which
  only got the aux site, leaving the main loop sending a different tag set.
* Tests should assert the same tag list everywhere; centralizing makes that
  assertion a one-liner against this module.

Do NOT pre-compute these as module-level constants in the consumers. The
version can change at runtime (editable installs, hot-reload tooling), and
``nozich_cli.__version__`` is the canonical source of truth.
"""

from __future__ import annotations

from typing import List


def _nozich_version() -> str:
    """Return the current Nozich release version, e.g. ``"0.13.0"``.

    Falls back to ``"unknown"`` if ``nozich_cli`` cannot be imported (should
    never happen in a real install — guarded for defensive testing).
    """
    try:
        from nozich_cli import __version__
        return __version__
    except Exception:
        return "unknown"


def nozich_client_tag() -> str:
    """Return the ``client=...`` tag for Nous Portal requests.

    Format: ``client=nozich-client-v<MAJOR>.<MINOR>.<PATCH>``.
    """
    return f"client=nozich-client-v{_nozich_version()}"


def nous_portal_tags() -> List[str]:
    """Return the canonical list of Nous Portal product tags.

    Always returns a fresh list so callers can mutate it freely
    (e.g. ``merged_extra.setdefault("tags", []).extend(nous_portal_tags())``).
    """
    return ["product=nozich-agent", nozich_client_tag()]
