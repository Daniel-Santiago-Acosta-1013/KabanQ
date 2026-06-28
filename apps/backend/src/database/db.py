"""PostgreSQL database access without ORMs."""
import os
from contextlib import contextmanager
from typing import Any

import psycopg
from psycopg.rows import dict_row

from ..models.todo import Todo, TodoStatus

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/kabanq",
)

INIT_SCRIPT = """
CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'backlog',
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
"""


@contextmanager
def get_connection():
    conn = psycopg.connect(DATABASE_URL, row_factory=dict_row)
    try:
        yield conn
    finally:
        conn.close()


def init_db() -> None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(INIT_SCRIPT)
            cur.execute(
                "ALTER TABLE todos ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0"
            )
        conn.commit()


def row_to_todo(row: dict[str, Any]) -> Todo:
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
                "UPDATE todos SET position = position + 1 WHERE status = %s",
                (status.value,),
            )
            cur = conn.execute(
                "INSERT INTO todos (title, description, status, position) VALUES (%s, %s, %s, %s) RETURNING *",
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
                "SELECT * FROM todos WHERE id = %s", (todo_id,)
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
                            WHERE status = %s AND position >= %s AND position < %s
                            """,
                            (new_status.value, new_position, old_position),
                        )
                    elif new_position > old_position:
                        conn.execute(
                            """
                            UPDATE todos
                            SET position = position - 1
                            WHERE status = %s AND position > %s AND position <= %s
                            """,
                            (new_status.value, old_position, new_position),
                        )
                else:
                    conn.execute(
                        """
                        UPDATE todos
                        SET position = position - 1
                        WHERE status = %s AND position > %s
                        """,
                        (old_status.value, old_position),
                    )
                    conn.execute(
                        """
                        UPDATE todos
                        SET position = position + 1
                        WHERE status = %s AND position >= %s
                        """,
                        (new_status.value, new_position),
                    )

            cur = conn.execute(
                """
                UPDATE todos
                SET title = %s, description = %s, status = %s, position = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
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
                "SELECT status, position FROM todos WHERE id = %s", (todo_id,)
            ).fetchone()
            if current is None:
                raise ValueError(f"Todo with id {todo_id} not found")

            conn.execute("DELETE FROM todos WHERE id = %s", (todo_id,))
            conn.execute(
                """
                UPDATE todos
                SET position = position - 1
                WHERE status = %s AND position > %s
                """,
                (current["status"], current["position"]),
            )
            conn.commit()

    def get_all(self, status: TodoStatus | None = None) -> list[Todo]:
        sql = "SELECT * FROM todos"
        params: list[Any] = []
        if status:
            sql += " WHERE status = %s"
            params.append(status.value)
        sql += " ORDER BY position ASC, updated_at DESC"
        with get_connection() as conn:
            cur = conn.execute(sql, params)
            return [row_to_todo(row) for row in cur.fetchall()]

    def get_by_id(self, todo_id: int) -> Todo:
        sql = "SELECT * FROM todos WHERE id = %s"
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
