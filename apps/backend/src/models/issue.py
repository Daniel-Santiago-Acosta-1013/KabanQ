"""Domain model for an Issue (formerly Todo)."""
from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Optional

from .priority import Priority


@dataclass
class Issue:
    id: Optional[int] = None
    title: str = ""
    description: str = ""
    status_id: Optional[int] = None
    priority: Priority = Priority.MEDIUM
    position: int = 0
    due_date: Optional[date] = None
    estimate: Optional[int] = None
    project_id: Optional[int] = None
    cycle_id: Optional[int] = None
    parent_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # Populated from joins
    status_slug: Optional[str] = None
    status_name: Optional[str] = None
    status_color: Optional[str] = None
    project_name: Optional[str] = None
    project_color: Optional[str] = None
    cycle_name: Optional[str] = None
    label_ids: list[int] = field(default_factory=list)
    labels: list[dict] = field(default_factory=list)
    sub_issues: list["Issue"] = field(default_factory=list)
    relations: list[dict] = field(default_factory=list)
    custom_field_values: list[dict] = field(default_factory=list)

    def __post_init__(self):
        if isinstance(self.priority, str):
            self.priority = Priority(self.priority)
