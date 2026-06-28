"""CQRS command types for issues."""
from dataclasses import dataclass
from datetime import date
from typing import Any

from ..models.priority import Priority


class Command:
    """Base command marker."""


@dataclass
class CreateIssueCommand(Command):
    title: str
    description: str = ""
    status_id: int | None = None
    priority: Priority = Priority.MEDIUM
    position: int = 0
    due_date: date | None = None
    estimate: int | None = None
    project_id: int | None = None
    cycle_id: int | None = None
    parent_id: int | None = None
    label_ids: list[int] | None = None
    custom_field_values: list[dict] | None = None


@dataclass
class UpdateIssueCommand(Command):
    issue_id: int
    title: str | None = None
    description: str | None = None
    status_id: int | None = None
    priority: Priority | None = None
    position: int | None = None
    due_date: date | None = None
    estimate: int | None = None
    project_id: int | None = None
    cycle_id: int | None = None
    parent_id: int | None = None
    label_ids: list[int] | None = None
    custom_field_values: list[dict] | None = None


@dataclass
class DeleteIssueCommand(Command):
    issue_id: int


class CommandResult:
    def __init__(self, data: Any, success: bool = True, error: str | None = None):
        self.data = data
        self.success = success
        self.error = error

    def to_dict(self):
        return {"success": self.success, "data": self.data, "error": self.error}
