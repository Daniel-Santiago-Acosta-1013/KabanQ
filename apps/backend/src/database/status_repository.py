"""Status repository."""
from typing import Any

from ..models.status import Status
from .connection import get_connection


class StatusRepository:
    def _row_to_status(self, row: dict[str, Any]) -> Status:
        return Status(
            id=row["id"],
            name=row["name"],
            slug=row["slug"],
            color=row["color"],
            position=row["position"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )

    def get_all(self) -> list[Status]:
        with get_connection() as conn:
            cur = conn.execute(
                "SELECT * FROM statuses ORDER BY position ASC, created_at ASC"
            )
            return [self._row_to_status(row) for row in cur.fetchall()]

    def get_by_id(self, status_id: int) -> Status:
        with get_connection() as conn:
            cur = conn.execute("SELECT * FROM statuses WHERE id = %s", (status_id,))
            row = cur.fetchone()
            if row is None:
                raise ValueError(f"Status with id {status_id} not found")
            return self._row_to_status(row)

    def get_by_slug(self, slug: str) -> Status:
        with get_connection() as conn:
            cur = conn.execute("SELECT * FROM statuses WHERE slug = %s", (slug,))
            row = cur.fetchone()
            if row is None:
                raise ValueError(f"Status with slug {slug} not found")
            return self._row_to_status(row)

    def create(self, name: str, slug: str, color: str, position: int = 0) -> Status:
        with get_connection() as conn:
            cur = conn.execute(
                """
                INSERT INTO statuses (name, slug, color, position)
                VALUES (%s, %s, %s, %s)
                RETURNING *
                """,
                (name, slug, color, position),
            )
            row = cur.fetchone()
            conn.commit()
            return self._row_to_status(row)

    def update(
        self, status_id: int, name: str, slug: str, color: str, position: int
    ) -> Status:
        with get_connection() as conn:
            cur = conn.execute(
                """
                UPDATE statuses
                SET name = %s, slug = %s, color = %s, position = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING *
                """,
                (name, slug, color, position, status_id),
            )
            row = cur.fetchone()
            if row is None:
                raise ValueError(f"Status with id {status_id} not found")
            conn.commit()
            return self._row_to_status(row)

    def delete(self, status_id: int) -> None:
        with get_connection() as conn:
            cur = conn.execute(
                "DELETE FROM statuses WHERE id = %s RETURNING id", (status_id,)
            )
            if cur.fetchone() is None:
                raise ValueError(f"Status with id {status_id} not found")
            conn.commit()
