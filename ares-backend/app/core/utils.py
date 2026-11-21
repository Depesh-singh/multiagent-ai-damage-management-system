"""ARES Core utility functions."""

from __future__ import annotations

import uuid
from typing import Any, Optional


def as_uuid(val: Any) -> Optional[uuid.UUID]:
    """Safely converts a string or UUID object to a uuid.UUID instance."""
    if val is None:
        return None
    if isinstance(val, uuid.UUID):
        return val
    try:
        return uuid.UUID(str(val))
    except Exception:
        return None
