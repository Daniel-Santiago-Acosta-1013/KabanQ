"""Cycle (sprint/iteration) model."""
from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Optional


@dataclass
class Cycle:
    id: Optional[int] = None
    name: str = ""
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
