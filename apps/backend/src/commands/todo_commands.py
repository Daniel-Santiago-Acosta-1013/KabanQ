"""CQRS command types and handlers."""
from dataclasses import dataclass
from typing import Any

from ..models.todo import Todo, TodoStatus


class Command:
    """Base command marker."""


@dataclass
class CreateTodoCommand(Command):
    title: str
    description: str
    status: TodoStatus = TodoStatus.BACKLOG


@dataclass
class UpdateTodoCommand(Command):
    todo_id: int
    title: str
    description: str
    status: TodoStatus


@dataclass
class DeleteTodoCommand(Command):
    todo_id: int


class CommandResult:
    def __init__(self, data: Any, success: bool = True, error: str | None = None):
        self.data = data
        self.success = success
        self.error = error

    def to_dict(self):
        return {"success": self.success, "data": self.data, "error": self.error}
