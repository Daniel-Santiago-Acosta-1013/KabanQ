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
    position INTEGER NOT NULL DEFAULT 0,
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
        _migrate_add_position(conn)
        conn.commit()


def _migrate_add_position(conn: sqlite3.Connection) -> None:
    columns = [row["name"] for row in conn.execute("PRAGMA table_info(todos)").fetchall()]
    if "position" not in columns:
        conn.execute("ALTER TABLE todos ADD COLUMN position INTEGER NOT NULL DEFAULT 0")


def row_to_todo(row: sqlite3.Row) -> Todo:
    return Todo(
        id=row["id"],
        title=row["title"],
        description=row["description"],
        status=TodoStatus(row["status"]),
        position=row["position"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


class TodoRepository:
    def create(
        self, title: str, description: str, status: TodoStatus, position: int = 0
    ) -> Todo:
        with get_connection() as conn:
            conn.execute(
                "UPDATE todos SET position = position + 1 WHERE status = ?",
                (status.value,),
            )
            cur = conn.execute(
                "INSERT INTO todos (title, description, status, position) VALUES (?, ?, ?, ?) RETURNING *",
                (title, description, status.value, position),
            )
            row = cur.fetchone()
            conn.commit()
            return row_to_todo(row)

    def update(
        self,
        todo_id: int,
        title: str,
        description: str,
        status: TodoStatus,
        position: int | None = None,
    ) -> Todo:
        with get_connection() as conn:
            current = conn.execute(
                "SELECT * FROM todos WHERE id = ?", (todo_id,)
            ).fetchone()
            if current is None:
                raise ValueError(f"Todo with id {todo_id} not found")

            old_status = TodoStatus(current["status"])
            old_position = current["position"]

            new_status = status
            new_position = position if position is not None else old_position

            if position is not None:
                if old_status == new_status:
                    if new_position < old_position:
                        conn.execute(
                            """
                            UPDATE todos
                            SET position = position + 1
                            WHERE status = ? AND position >= ? AND position < ?
                            """,
                            (new_status.value, new_position, old_position),
                        )
                    elif new_position > old_position:
                        conn.execute(
                            """
                            UPDATE todos
                            SET position = position - 1
                            WHERE status = ? AND position > ? AND position <= ?
                            """,
                            (new_status.value, old_position, new_position),
                        )
                else:
                    conn.execute(
                        """
                        UPDATE todos
                        SET position = position - 1
                        WHERE status = ? AND position > ?
                        """,
                        (old_status.value, old_position),
                    )
                    conn.execute(
                        """
                        UPDATE todos
                        SET position = position + 1
                        WHERE status = ? AND position >= ?
                        """,
                        (new_status.value, new_position),
                    )

            cur = conn.execute(
                """
                UPDATE todos
                SET title = ?, description = ?, status = ?, position = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                RETURNING *
                """,
                (title, description, new_status.value, new_position, todo_id),
            )
            row = cur.fetchone()
            conn.commit()
            return row_to_todo(row)

    def delete(self, todo_id: int) -> None:
        with get_connection() as conn:
            current = conn.execute(
                "SELECT status, position FROM todos WHERE id = ?", (todo_id,)
            ).fetchone()
            if current is None:
                raise ValueError(f"Todo with id {todo_id} not found")

            conn.execute("DELETE FROM todos WHERE id = ?", (todo_id,))
            conn.execute(
                """
                UPDATE todos
                SET position = position - 1
                WHERE status = ? AND position > ?
                """,
                (current["status"], current["position"]),
            )
            conn.commit()

    def get_all(self, status: TodoStatus | None = None) -> list[Todo]:
        sql = "SELECT * FROM todos"
        params: list[Any] = []
        if status:
            sql += " WHERE status = ?"
            params.append(status.value)
        sql += " ORDER BY position ASC, updated_at DESC"
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
