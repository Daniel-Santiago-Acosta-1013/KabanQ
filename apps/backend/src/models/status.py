"""Status model for issue workflows."""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class Status:
    id: Optional[int] = None
    name: str = ""
    slug: str = ""
    color: str = "#94a3b8"
    position: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
