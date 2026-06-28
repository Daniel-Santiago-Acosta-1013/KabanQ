"""Label model."""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class Label:
    id: Optional[int] = None
    name: str = ""
    color: str = "#94a3b8"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
