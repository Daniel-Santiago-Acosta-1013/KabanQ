"""Custom field repository."""
from typing import Any

from ..models.custom_field import CustomField
from .connection import get_connection


class CustomFieldRepository:
    def _row_to_custom_field(self, row: dict[str, Any]) -> CustomField:
        return CustomField(
            id=row["id"],
            name=row["name"],
            field_type=row["field_type"],
            options=row["options"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )

    def get_all(self) -> list[CustomField]:
        with get_connection() as conn:
            cur = conn.execute("SELECT * FROM custom_fields ORDER BY name ASC")
            return [self._row_to_custom_field(row) for row in cur.fetchall()]

    def get_by_id(self, custom_field_id: int) -> CustomField:
        with get_connection() as conn:
            cur = conn.execute(
                "SELECT * FROM custom_fields WHERE id = %s", (custom_field_id,)
            )
            row = cur.fetchone()
            if row is None:
                raise ValueError(f"Custom field with id {custom_field_id} not found")
            return self._row_to_custom_field(row)

    def create(self, name: str, field_type: str, options: str = "") -> CustomField:
        with get_connection() as conn:
            cur = conn.execute(
                """
                INSERT INTO custom_fields (name, field_type, options)
                VALUES (%s, %s, %s)
                RETURNING *
                """,
                (name, field_type, options),
            )
            row = cur.fetchone()
            conn.commit()
            return self._row_to_custom_field(row)

    def update(
        self, custom_field_id: int, name: str, field_type: str, options: str
    ) -> CustomField:
        with get_connection() as conn:
            cur = conn.execute(
                """
                UPDATE custom_fields
                SET name = %s, field_type = %s, options = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING *
                """,
                (name, field_type, options, custom_field_id),
            )
            row = cur.fetchone()
            if row is None:
                raise ValueError(f"Custom field with id {custom_field_id} not found")
            conn.commit()
            return self._row_to_custom_field(row)

    def delete(self, custom_field_id: int) -> None:
        with get_connection() as conn:
            cur = conn.execute(
                "DELETE FROM custom_fields WHERE id = %s RETURNING id",
                (custom_field_id,),
            )
            if cur.fetchone() is None:
                raise ValueError(f"Custom field with id {custom_field_id} not found")
            conn.commit()
