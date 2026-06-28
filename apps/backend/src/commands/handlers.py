"""Command handlers for the Todo domain."""
from .todo_commands import (
    CommandResult,
    CreateTodoCommand,
    DeleteTodoCommand,
    UpdateTodoCommand,
)
from ..database.db import TodoRepository


class TodoCommandHandler:
    def __init__(self, repository: TodoRepository):
        self._repository = repository

    def handle_create(self, cmd: CreateTodoCommand) -> CommandResult:
        try:
            todo = self._repository.create(
                cmd.title, cmd.description, cmd.status, cmd.position
            )
            return CommandResult(todo.__dict__)
        except Exception as exc:
            return CommandResult(None, success=False, error=str(exc))

    def handle_update(self, cmd: UpdateTodoCommand) -> CommandResult:
        try:
            todo = self._repository.update(
                cmd.todo_id, cmd.title, cmd.description, cmd.status, cmd.position
            )
            return CommandResult(todo.__dict__)
        except Exception as exc:
            return CommandResult(None, success=False, error=str(exc))

    def handle_delete(self, cmd: DeleteTodoCommand) -> CommandResult:
        try:
            self._repository.delete(cmd.todo_id)
            return CommandResult({"deleted": True})
        except Exception as exc:
            return CommandResult(None, success=False, error=str(exc))
