"""CQRS read/query side."""
from ..database.db import TodoRepository
from ..models.todo import Todo, TodoStatus


class TodoQueryHandler:
    def __init__(self, repository: TodoRepository):
        self._repository = repository

    def get_all(self, status: TodoStatus | None = None) -> list[Todo]:
        return self._repository.get_all(status)

    def get_by_id(self, todo_id: int) -> Todo:
        return self._repository.get_by_id(todo_id)

    def get_board(self) -> dict:
        todos = self._repository.get_all()
        columns = ["backlog", "todo", "in_progress", "done"]
        board = {col: [] for col in columns}
        for todo in todos:
            board[todo.status.value].append(todo.__dict__)
        counts = self._repository.count_by_status()
        for col in columns:
            counts.setdefault(col, 0)
        return {"board": board, "counts": counts}
