"""Cycle repository."""
from datetime import date
from typing import Any

from ..models.cycle import Cycle
from .connection import get_connection


class CycleRepository:
    def _row_to_cycle(self, row: dict[str, Any]) -> Cycle:
        return Cycle(
            id=row["id"],
            name=row["name"],
            start_date=row["start_date"],
            end_date=row["end_date"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )

    def get_all(self) -> list[Cycle]:
        with get_connection() as conn:
            cur = conn.execute("SELECT * FROM cycles ORDER BY start_date DESC NULLS LAST")
            return [self._row_to_cycle(row) for row in cur.fetchall()]

    def get_by_id(self, cycle_id: int) -> Cycle:
        with get_connection() as conn:
            cur = conn.execute("SELECT * FROM cycles WHERE id = %s", (cycle_id,))
            row = cur.fetchone()
            if row is None:
                raise ValueError(f"Cycle with id {cycle_id} not found")
            return self._row_to_cycle(row)

    def create(
        self, name: str, start_date: date | None = None, end_date: date | None = None
    ) -> Cycle:
        with get_connection() as conn:
            cur = conn.execute(
                """
                INSERT INTO cycles (name, start_date, end_date)
                VALUES (%s, %s, %s)
                RETURNING *
                """,
                (name, start_date, end_date),
            )
            row = cur.fetchone()
            conn.commit()
            return self._row_to_cycle(row)

    def update(
        self, cycle_id: int, name: str, start_date: date | None, end_date: date | None
    ) -> Cycle:
        with get_connection() as conn:
            cur = conn.execute(
                """
                UPDATE cycles
                SET name = %s, start_date = %s, end_date = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING *
                """,
                (name, start_date, end_date, cycle_id),
            )
            row = cur.fetchone()
            if row is None:
                raise ValueError(f"Cycle with id {cycle_id} not found")
            conn.commit()
            return self._row_to_cycle(row)

    def delete(self, cycle_id: int) -> None:
        with get_connection() as conn:
            cur = conn.execute(
                "DELETE FROM cycles WHERE id = %s RETURNING id", (cycle_id,)
            )
            if cur.fetchone() is None:
                raise ValueError(f"Cycle with id {cycle_id} not found")
            conn.commit()
