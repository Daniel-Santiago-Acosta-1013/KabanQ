"""Simple dependency injection container."""
from ..commands.handlers import TodoCommandHandler
from ..infrastructure.db import TodoRepository
from ..queries.todo_queries import TodoQueryHandler


class Container:
    def __init__(self):
        self.repository = TodoRepository()
        self.command_handler = TodoCommandHandler(self.repository)
        self.query_handler = TodoQueryHandler(self.repository)


container = Container()
