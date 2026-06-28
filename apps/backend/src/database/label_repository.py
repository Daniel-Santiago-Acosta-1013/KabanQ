"""Label repository."""
from typing import Any

from ..models.label import Label
from .connection import get_connection


class LabelRepository:
    def _row_to_label(self, row: dict[str, Any]) -> Label:
        return Label(
            id=row["id"],
            name=row["name"],
            color=row["color"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )

    def get_all(self) -> list[Label]:
        with get_connection() as conn:
            cur = conn.execute("SELECT * FROM labels ORDER BY name ASC")
            return [self._row_to_label(row) for row in cur.fetchall()]

    def get_by_id(self, label_id: int) -> Label:
        with get_connection() as conn:
            cur = conn.execute("SELECT * FROM labels WHERE id = %s", (label_id,))
            row = cur.fetchone()
            if row is None:
                raise ValueError(f"Label with id {label_id} not found")
            return self._row_to_label(row)

    def create(self, name: str, color: str) -> Label:
        with get_connection() as conn:
            cur = conn.execute(
                "INSERT INTO labels (name, color) VALUES (%s, %s) RETURNING *",
                (name, color),
            )
            row = cur.fetchone()
            conn.commit()
            return self._row_to_label(row)

    def update(self, label_id: int, name: str, color: str) -> Label:
        with get_connection() as conn:
            cur = conn.execute(
                """
                UPDATE labels
                SET name = %s, color = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING *
                """,
                (name, color, label_id),
            )
            row = cur.fetchone()
            if row is None:
                raise ValueError(f"Label with id {label_id} not found")
            conn.commit()
            return self._row_to_label(row)

    def delete(self, label_id: int) -> None:
        with get_connection() as conn:
            cur = conn.execute(
                "DELETE FROM labels WHERE id = %s RETURNING id", (label_id,)
            )
            if cur.fetchone() is None:
                raise ValueError(f"Label with id {label_id} not found")
            conn.commit()
