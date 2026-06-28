"""Command handlers for the Issue domain."""
from ..database import IssueRepository
from .issue_commands import (
    CommandResult,
    CreateIssueCommand,
    DeleteIssueCommand,
    UpdateIssueCommand,
)


class IssueCommandHandler:
    def __init__(self, repository: IssueRepository):
        self._repository = repository

    def handle_create(self, cmd: CreateIssueCommand) -> CommandResult:
        try:
            issue = self._repository.create(
                title=cmd.title,
                description=cmd.description,
                status_id=cmd.status_id,
                priority=cmd.priority,
                position=cmd.position,
                due_date=cmd.due_date,
                estimate=cmd.estimate,
                project_id=cmd.project_id,
                cycle_id=cmd.cycle_id,
                parent_id=cmd.parent_id,
                label_ids=cmd.label_ids,
                custom_field_values=cmd.custom_field_values,
            )
            return CommandResult(issue.__dict__)
        except Exception as exc:
            return CommandResult(None, success=False, error=str(exc))

    def handle_update(self, cmd: UpdateIssueCommand) -> CommandResult:
        try:
            issue = self._repository.update(
                issue_id=cmd.issue_id,
                title=cmd.title,
                description=cmd.description,
                status_id=cmd.status_id,
                priority=cmd.priority,
                position=cmd.position,
                due_date=cmd.due_date,
                estimate=cmd.estimate,
                project_id=cmd.project_id,
                cycle_id=cmd.cycle_id,
                parent_id=cmd.parent_id,
                label_ids=cmd.label_ids,
                custom_field_values=cmd.custom_field_values,
            )
            return CommandResult(issue.__dict__)
        except Exception as exc:
            return CommandResult(None, success=False, error=str(exc))

    def handle_delete(self, cmd: DeleteIssueCommand) -> CommandResult:
        try:
            self._repository.delete(cmd.issue_id)
            return CommandResult({"deleted": True})
        except Exception as exc:
            return CommandResult(None, success=False, error=str(exc))
