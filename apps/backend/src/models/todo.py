"""Domain model for a Todo."""
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional


class TodoStatus(str, Enum):
    BACKLOG = "backlog"
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"


@dataclass
class Todo:
    id: Optional[int] = None
    title: str = ""
    description: str = ""
    status: TodoStatus = TodoStatus.BACKLOG
    position: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        if isinstance(self.status, str):
            self.status = TodoStatus(self.status)
