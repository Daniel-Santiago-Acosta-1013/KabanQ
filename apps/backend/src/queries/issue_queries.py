"""CQRS read/query side for issues."""
from datetime import date

from ..database import IssueRepository, StatusRepository
from ..models.issue import Issue
from ..models.priority import Priority


class IssueQueryHandler:
    def __init__(self, repository: IssueRepository):
        self._repository = repository

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
        return self._repository.get_all(
            status_id=status_id,
            project_id=project_id,
            cycle_id=cycle_id,
            label_ids=label_ids,
            priority=priority,
            parent_id=parent_id,
            due_before=due_before,
            due_after=due_after,
            query=query,
        )

    def get_by_id(self, issue_id: int) -> Issue:
        return self._repository.get_by_id(issue_id)

    def get_board(self, project_id: int | None = None, cycle_id: int | None = None) -> dict:
        return self._repository.get_board(project_id=project_id, cycle_id=cycle_id)

    def get_inbox(self) -> list[Issue]:
        today = date.today()
        return self._repository.get_all(
            due_after=today,
            due_before=None,
            priority=None,
        )

    def count_by_status(self) -> dict[str, int]:
        return self._repository.get_board()["counts"]
