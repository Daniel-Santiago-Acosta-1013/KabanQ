"""SQLite database access without ORMs."""
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Any

from ..models.todo import Todo, TodoStatus

DB_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "todos.db"
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

INIT_SCRIPT = """
CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'backlog',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
"""


@contextmanager
def get_connection():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def init_db() -> None:
    with get_connection() as conn:
        conn.executescript(INIT_SCRIPT)
        conn.commit()


def row_to_todo(row: sqlite3.Row) -> Todo:
    return Todo(
        id=row["id"],
        title=row["title"],
        description=row["description"],
        status=TodoStatus(row["status"]),
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


class TodoRepository:
    def create(self, title: str, description: str, status: TodoStatus) -> Todo:
        sql = """
            INSERT INTO todos (title, description, status)
            VALUES (?, ?, ?)
            RETURNING *
        """
        with get_connection() as conn:
            cur = conn.execute(sql, (title, description, status.value))
            row = cur.fetchone()
            conn.commit()
            return row_to_todo(row)

    def update(self, todo_id: int, title: str, description: str, status: TodoStatus) -> Todo:
        sql = """
            UPDATE todos
            SET title = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            RETURNING *
        """
        with get_connection() as conn:
            cur = conn.execute(sql, (title, description, status.value, todo_id))
            row = cur.fetchone()
            conn.commit()
            if row is None:
                raise ValueError(f"Todo with id {todo_id} not found")
            return row_to_todo(row)

    def delete(self, todo_id: int) -> None:
        sql = "DELETE FROM todos WHERE id = ?"
        with get_connection() as conn:
            cur = conn.execute(sql, (todo_id,))
            if cur.rowcount == 0:
                raise ValueError(f"Todo with id {todo_id} not found")
            conn.commit()

    def get_all(self, status: TodoStatus | None = None) -> list[Todo]:
        sql = "SELECT * FROM todos"
        params: list[Any] = []
        if status:
            sql += " WHERE status = ?"
            params.append(status.value)
        sql += " ORDER BY updated_at DESC"
        with get_connection() as conn:
            cur = conn.execute(sql, params)
            return [row_to_todo(row) for row in cur.fetchall()]

    def get_by_id(self, todo_id: int) -> Todo:
        sql = "SELECT * FROM todos WHERE id = ?"
        with get_connection() as conn:
            cur = conn.execute(sql, (todo_id,))
            row = cur.fetchone()
            if row is None:
                raise ValueError(f"Todo with id {todo_id} not found")
            return row_to_todo(row)

    def count_by_status(self) -> dict[str, int]:
        sql = """
            SELECT status, COUNT(*) as count
            FROM todos
            GROUP BY status
        """
        with get_connection() as conn:
            cur = conn.execute(sql)
            return {row["status"]: row["count"] for row in cur.fetchall()}
