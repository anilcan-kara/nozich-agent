"""Resolve NOZICH_HOME for standalone skill scripts.

Skill scripts may run outside the Nozich process (e.g. system Python,
nix env, CI) where ``nozich_constants`` is not importable.  This module
provides the same ``get_nozich_home()`` and ``display_nozich_home()``
contracts as ``nozich_constants`` without requiring it on ``sys.path``.

When ``nozich_constants`` IS available it is used directly so that any
future enhancements (profile resolution, Docker detection, etc.) are
picked up automatically.  The fallback path replicates the core logic
from ``nozich_constants.py`` using only the stdlib.

All scripts under ``google-workspace/scripts/`` should import from here
instead of duplicating the ``NOZICH_HOME = Path(os.getenv(...))`` pattern.
"""

from __future__ import annotations

import os
from pathlib import Path

try:
    from nozich_constants import display_nozich_home as display_nozich_home
    from nozich_constants import get_nozich_home as get_nozich_home
except (ModuleNotFoundError, ImportError):

    def get_nozich_home() -> Path:
        """Return the Nozich home directory (default: ~/.nozich).

        Mirrors ``nozich_constants.get_nozich_home()``."""
        val = os.environ.get("NOZICH_HOME", "").strip()
        return Path(val) if val else Path.home() / ".nozich"

    def display_nozich_home() -> str:
        """Return a user-friendly ``~/``-shortened display string.

        Mirrors ``nozich_constants.display_nozich_home()``."""
        home = get_nozich_home()
        try:
            return "~/" + str(home.relative_to(Path.home()))
        except ValueError:
            return str(home)
