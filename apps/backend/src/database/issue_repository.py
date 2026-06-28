"""Issue repository with labels, relations, sub-issues and custom fields."""
from datetime import date
from typing import Any

from ..models.issue import Issue
from ..models.priority import Priority
from .connection import get_connection


class IssueRepository:
    def _base_select(self) -> str:
        return """
            SELECT
                i.*,
                s.name as status_name,
                s.slug as status_slug,
                s.color as status_color,
                p.name as project_name,
                p.color as project_color,
                c.name as cycle_name
            FROM issues i
            LEFT JOIN statuses s ON i.status_id = s.id
            LEFT JOIN projects p ON i.project_id = p.id
            LEFT JOIN cycles c ON i.cycle_id = c.id
        """

    def _row_to_issue(self, row: dict[str, Any]) -> Issue:
        return Issue(
            id=row["id"],
            title=row["title"],
            description=row["description"],
            status_id=row["status_id"],
            priority=Priority(row["priority"]),
            position=row["position"],
            due_date=row["due_date"],
            estimate=row["estimate"],
            project_id=row["project_id"],
            cycle_id=row["cycle_id"],
            parent_id=row["parent_id"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
            status_slug=row.get("status_slug"),
            status_name=row.get("status_name"),
            status_color=row.get("status_color"),
            project_name=row.get("project_name"),
            project_color=row.get("project_color"),
            cycle_name=row.get("cycle_name"),
        )

    def _attach_labels(self, conn, issues: list[Issue]) -> None:
        if not issues:
            return
        issue_ids = [i.id for i in issues]
        cur = conn.execute(
            """
            SELECT il.issue_id, l.id, l.name, l.color
            FROM issue_labels il
            JOIN labels l ON il.label_id = l.id
            WHERE il.issue_id = ANY(%s)
            """,
            (issue_ids,),
        )
        labels_by_issue: dict[int, list[dict]] = {}
        for row in cur.fetchall():
            labels_by_issue.setdefault(row["issue_id"], []).append(
                {"id": row["id"], "name": row["name"], "color": row["color"]}
            )
        for issue in issues:
            issue.labels = labels_by_issue.get(issue.id, [])
            issue.label_ids = [l["id"] for l in issue.labels]

    def _attach_relations(self, conn, issues: list[Issue]) -> None:
        if not issues:
            return
        issue_ids = [i.id for i in issues]
        cur = conn.execute(
            """
            SELECT
                ir.id,
                ir.source_id,
                ir.target_id,
                ir.relation_type,
                i.title as target_title
            FROM issue_relations ir
            JOIN issues i ON ir.target_id = i.id
            WHERE ir.source_id = ANY(%s)
            """,
            (issue_ids,),
        )
        relations_by_issue: dict[int, list[dict]] = {}
        for row in cur.fetchall():
            relations_by_issue.setdefault(row["source_id"], []).append(
                {
                    "id": row["id"],
                    "target_id": row["target_id"],
                    "relation_type": row["relation_type"],
                    "target_title": row["target_title"],
                }
            )
        for issue in issues:
            issue.relations = relations_by_issue.get(issue.id, [])

    def _attach_custom_field_values(self, conn, issues: list[Issue]) -> None:
        if not issues:
            return
        issue_ids = [i.id for i in issues]
        cur = conn.execute(
            """
            SELECT
                icfv.issue_id,
                icfv.custom_field_id,
                icfv.value,
                cf.name as field_name,
                cf.field_type
            FROM issue_custom_field_values icfv
            JOIN custom_fields cf ON icfv.custom_field_id = cf.id
            WHERE icfv.issue_id = ANY(%s)
            """,
            (issue_ids,),
        )
        values_by_issue: dict[int, list[dict]] = {}
        for row in cur.fetchall():
            values_by_issue.setdefault(row["issue_id"], []).append(
                {
                    "custom_field_id": row["custom_field_id"],
                    "value": row["value"],
                    "field_name": row["field_name"],
                    "field_type": row["field_type"],
                }
            )
        for issue in issues:
            issue.custom_field_values = values_by_issue.get(issue.id, [])

    def _attach_sub_issues(self, conn, issue: Issue) -> None:
        cur = conn.execute(
            self._base_select() + " WHERE i.parent_id = %s ORDER BY i.position ASC, i.created_at ASC",
            (issue.id,),
        )
        sub_issues = [self._row_to_issue(row) for row in cur.fetchall()]
        self._attach_labels(conn, sub_issues)
        self._attach_relations(conn, sub_issues)
        self._attach_custom_field_values(conn, sub_issues)
        issue.sub_issues = sub_issues

    def _hydrate(self, conn, issues: list[Issue], include_sub_issues: bool = False) -> list[Issue]:
        self._attach_labels(conn, issues)
        self._attach_relations(conn, issues)
        self._attach_custom_field_values(conn, issues)
        if include_sub_issues:
            for issue in issues:
                self._attach_sub_issues(conn, issue)
        return issues

    def get_all(
        self,
        status_id: int | None = None,
        project_id: int | None = None,
        cycle_id: int | None = None,
        label_ids: list[int] | None = None,
        priority: Priority | None = None,
        parent_id: int | None = None,
        due_before: date | None = None,
        due_after: date | None = None,
        query: str | None = None,
    ) -> list[Issue]:
        filters: list[str] = []
        params: list[Any] = []

        if status_id is not None:
            filters.append("i.status_id = %s")
            params.append(status_id)
        if project_id is not None:
            filters.append("i.project_id = %s")
            params.append(project_id)
        if cycle_id is not None:
            filters.append("i.cycle_id = %s")
            params.append(cycle_id)
        if priority is not None:
            filters.append("i.priority = %s")
            params.append(priority.value)
        if parent_id is not None:
            filters.append("i.parent_id = %s")
            params.append(parent_id)
        elif parent_id is None and "parent_id" not in [f.split("=")[0].strip() for f in filters]:
            # By default, only fetch top-level issues unless explicitly filtered
            filters.append("i.parent_id IS NULL")
        if due_before is not None:
            filters.append("i.due_date <= %s")
            params.append(due_before)
        if due_after is not None:
            filters.append("i.due_date >= %s")
            params.append(due_after)
        if query:
            filters.append("(LOWER(i.title) LIKE %s OR LOWER(i.description) LIKE %s)")
            params.append(f"%{query.lower()}%")
            params.append(f"%{query.lower()}%")

        sql = self._base_select()
        if filters:
            sql += " WHERE " + " AND ".join(filters)
        sql += " ORDER BY i.position ASC, i.updated_at DESC"

        with get_connection() as conn:
            cur = conn.execute(sql, params)
            issues = [self._row_to_issue(row) for row in cur.fetchall()]
            if label_ids:
                issue_ids = [i.id for i in issues]
                label_cur = conn.execute(
                    "SELECT issue_id FROM issue_labels WHERE issue_id = ANY(%s) AND label_id = ANY(%s)",
                    (issue_ids, label_ids),
                )
                matched_ids = {row["issue_id"] for row in label_cur.fetchall()}
                issues = [i for i in issues if i.id in matched_ids]
            return self._hydrate(conn, issues)

    def get_by_id(self, issue_id: int) -> Issue:
        with get_connection() as conn:
            cur = conn.execute(self._base_select() + " WHERE i.id = %s", (issue_id,))
            row = cur.fetchone()
            if row is None:
                raise ValueError(f"Issue with id {issue_id} not found")
            issue = self._row_to_issue(row)
            return self._hydrate(conn, [issue], include_sub_issues=True)[0]

    def get_board(
        self, project_id: int | None = None, cycle_id: int | None = None
    ) -> dict:
        statuses = StatusRepository().get_all()
        all_issues = self.get_all(project_id=project_id, cycle_id=cycle_id)

        board = {s.slug: [] for s in statuses}
        counts = {s.slug: 0 for s in statuses}

        for issue in all_issues:
            slug = issue.status_slug or "backlog"
            board.setdefault(slug, []).append(issue.__dict__)
            counts[slug] = counts.get(slug, 0) + 1

        return {"board": board, "counts": counts, "statuses": [s.__dict__ for s in statuses]}

    def create(
        self,
        title: str,
        description: str = "",
        status_id: int | None = None,
        priority: Priority = Priority.MEDIUM,
        position: int = 0,
        due_date: date | None = None,
        estimate: int | None = None,
        project_id: int | None = None,
        cycle_id: int | None = None,
        parent_id: int | None = None,
        label_ids: list[int] | None = None,
        custom_field_values: list[dict] | None = None,
    ) -> Issue:
        with get_connection() as conn:
            # Default status
            if status_id is None:
                cur = conn.execute(
                    "SELECT id FROM statuses ORDER BY position ASC LIMIT 1"
                )
                row = cur.fetchone()
                status_id = row["id"] if row else None

            if position is None:
                position = 0

            cur = conn.execute(
                """
                INSERT INTO issues
                (title, description, status_id, priority, position, due_date, estimate, project_id, cycle_id, parent_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *
                """,
                (
                    title,
                    description,
                    status_id,
                    priority.value,
                    position,
                    due_date,
                    estimate,
                    project_id,
                    cycle_id,
                    parent_id,
                ),
            )
            row = cur.fetchone()
            issue = self._row_to_issue(row)

            if label_ids:
                with conn.cursor() as label_cur:
                    label_cur.executemany(
                        "INSERT INTO issue_labels (issue_id, label_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                        [(issue.id, lid) for lid in label_ids],
                    )

            if custom_field_values:
                with conn.cursor() as cfv_cur:
                    cfv_cur.executemany(
                        """
                        INSERT INTO issue_custom_field_values (issue_id, custom_field_id, value)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (issue_id, custom_field_id) DO UPDATE SET value = EXCLUDED.value
                        """,
                        [
                            (issue.id, v["custom_field_id"], v["value"])
                            for v in custom_field_values
                        ],
                    )

            conn.commit()
            return self._hydrate(conn, [issue])[0]

    def update(
        self,
        issue_id: int,
        title: str | None = None,
        description: str | None = None,
        status_id: int | None = None,
        priority: Priority | None = None,
        position: int | None = None,
        due_date: date | None = None,
        estimate: int | None = None,
        project_id: int | None = None,
        cycle_id: int | None = None,
        parent_id: int | None = None,
        label_ids: list[int] | None = None,
        custom_field_values: list[dict] | None = None,
    ) -> Issue:
        with get_connection() as conn:
            current = conn.execute(
                "SELECT * FROM issues WHERE id = %s", (issue_id,)
            ).fetchone()
            if current is None:
                raise ValueError(f"Issue with id {issue_id} not found")

            fields = []
            params: list[Any] = []

            def set_field(name: str, value: Any, default: Any = None):
                if value is not None:
                    fields.append(f"{name} = %s")
                    params.append(value)
                elif default is not None:
                    fields.append(f"{name} = %s")
                    params.append(default)

            set_field("title", title)
            set_field("description", description)
            set_field("status_id", status_id)
            set_field("priority", priority.value if priority else None)
            set_field("position", position)
            set_field("due_date", due_date)
            set_field("estimate", estimate)
            set_field("project_id", project_id)
            set_field("cycle_id", cycle_id)
            set_field("parent_id", parent_id)

            if not fields:
                return self.get_by_id(issue_id)

            params.append(issue_id)
            sql = f"""
                UPDATE issues
                SET {', '.join(fields)}, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING *
            """
            cur = conn.execute(sql, params)
            row = cur.fetchone()
            issue = self._row_to_issue(row)

            if label_ids is not None:
                conn.execute(
                    "DELETE FROM issue_labels WHERE issue_id = %s", (issue_id,)
                )
                if label_ids:
                    with conn.cursor() as label_cur:
                        label_cur.executemany(
                            "INSERT INTO issue_labels (issue_id, label_id) VALUES (%s, %s)",
                            [(issue_id, lid) for lid in label_ids],
                        )

            if custom_field_values is not None:
                conn.execute(
                    "DELETE FROM issue_custom_field_values WHERE issue_id = %s",
                    (issue_id,),
                )
                if custom_field_values:
                    with conn.cursor() as cfv_cur:
                        cfv_cur.executemany(
                            """
                            INSERT INTO issue_custom_field_values (issue_id, custom_field_id, value)
                            VALUES (%s, %s, %s)
                            """,
                            [
                                (issue_id, v["custom_field_id"], v["value"])
                                for v in custom_field_values
                            ],
                        )

            conn.commit()
            return self._hydrate(conn, [issue])[0]

    def delete(self, issue_id: int) -> None:
        with get_connection() as conn:
            cur = conn.execute(
                "DELETE FROM issues WHERE id = %s RETURNING id", (issue_id,)
            )
            if cur.fetchone() is None:
                raise ValueError(f"Issue with id {issue_id} not found")
            conn.commit()

    # Relations
    def add_relation(
        self, source_id: int, target_id: int, relation_type: str
    ) -> dict:
        if source_id == target_id:
            raise ValueError("An issue cannot be related to itself")
        with get_connection() as conn:
            cur = conn.execute(
                """
                INSERT INTO issue_relations (source_id, target_id, relation_type)
                VALUES (%s, %s, %s)
                ON CONFLICT (source_id, target_id, relation_type) DO NOTHING
                RETURNING *
                """,
                (source_id, target_id, relation_type),
            )
            row = cur.fetchone()
            if row is None:
                raise ValueError("Relation already exists or invalid")
            conn.commit()
            return dict(row)

    def remove_relation(self, relation_id: int) -> None:
        with get_connection() as conn:
            cur = conn.execute(
                "DELETE FROM issue_relations WHERE id = %s RETURNING id",
                (relation_id,),
            )
            if cur.fetchone() is None:
                raise ValueError(f"Relation with id {relation_id} not found")
            conn.commit()


# Import here to avoid circular dependency at module load time
from .status_repository import StatusRepository  # noqa: E402
