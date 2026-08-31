"""
Shared AdapterResult type definition for all Member adapters.
"""
from typing import Literal, Optional, Any
from dataclasses import dataclass


@dataclass
class AdapterResult:
    status: Literal["ok", "error", "skipped"]
    data: Optional[dict[str, Any]] = None   # raw, untouched module output, only if status == "ok"
    error_message: Optional[str] = None     # only if status == "error"
