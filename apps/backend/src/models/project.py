"""Project model."""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class Project:
    id: Optional[int] = None
    name: str = ""
    description: str = ""
    color: str = "#6366f1"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
