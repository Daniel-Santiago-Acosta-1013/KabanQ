"""Project repository."""
from typing import Any

from ..models.project import Project
from .connection import get_connection


class ProjectRepository:
    def _row_to_project(self, row: dict[str, Any]) -> Project:
        return Project(
            id=row["id"],
            name=row["name"],
            description=row["description"],
            color=row["color"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )

    def get_all(self) -> list[Project]:
        with get_connection() as conn:
            cur = conn.execute("SELECT * FROM projects ORDER BY created_at DESC")
            return [self._row_to_project(row) for row in cur.fetchall()]

    def get_by_id(self, project_id: int) -> Project:
        with get_connection() as conn:
            cur = conn.execute("SELECT * FROM projects WHERE id = %s", (project_id,))
            row = cur.fetchone()
            if row is None:
                raise ValueError(f"Project with id {project_id} not found")
            return self._row_to_project(row)

    def create(self, name: str, description: str = "", color: str = "#6366f1") -> Project:
        with get_connection() as conn:
            cur = conn.execute(
                """
                INSERT INTO projects (name, description, color)
                VALUES (%s, %s, %s)
                RETURNING *
                """,
                (name, description, color),
            )
            row = cur.fetchone()
            conn.commit()
            return self._row_to_project(row)

    def update(
        self, project_id: int, name: str, description: str, color: str
    ) -> Project:
        with get_connection() as conn:
            cur = conn.execute(
                """
                UPDATE projects
                SET name = %s, description = %s, color = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING *
                """,
                (name, description, color, project_id),
            )
            row = cur.fetchone()
            if row is None:
                raise ValueError(f"Project with id {project_id} not found")
            conn.commit()
            return self._row_to_project(row)

    def delete(self, project_id: int) -> None:
        with get_connection() as conn:
            cur = conn.execute(
                "DELETE FROM projects WHERE id = %s RETURNING id", (project_id,)
            )
            if cur.fetchone() is None:
                raise ValueError(f"Project with id {project_id} not found")
            conn.commit()
