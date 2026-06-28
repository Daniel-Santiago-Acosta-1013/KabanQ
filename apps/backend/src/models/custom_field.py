"""Custom field model."""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


class CustomFieldType(str):
    TEXT = "text"
    NUMBER = "number"
    DATE = "date"
    SELECT = "select"


@dataclass
class CustomField:
    id: Optional[int] = None
    name: str = ""
    field_type: str = "text"
    options: str = ""  # JSON string for select options
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
