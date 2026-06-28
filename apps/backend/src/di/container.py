"""Simple dependency injection container."""
from ..commands.issue_handlers import IssueCommandHandler
from ..database import (
    IssueRepository,
    LabelRepository,
    ProjectRepository,
    StatusRepository,
    CycleRepository,
    CustomFieldRepository,
)
from ..queries.issue_queries import IssueQueryHandler


class Container:
    def __init__(self):
        self.issue_repository = IssueRepository()
        self.label_repository = LabelRepository()
        self.project_repository = ProjectRepository()
        self.status_repository = StatusRepository()
        self.cycle_repository = CycleRepository()
        self.custom_field_repository = CustomFieldRepository()

        self.command_handler = IssueCommandHandler(self.issue_repository)
        self.query_handler = IssueQueryHandler(self.issue_repository)


container = Container()
