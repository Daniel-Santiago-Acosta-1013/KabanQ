"""FastAPI routes exposing CQRS commands and queries."""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from ..commands.todo_commands import (
    CreateTodoCommand,
    DeleteTodoCommand,
    UpdateTodoCommand,
)
from ..di.container import container
from ..infrastructure.db import init_db
from ..models.todo import TodoStatus

app = FastAPI(title="Todo CQRS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


class TodoCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=2000)
    status: TodoStatus = Field(default=TodoStatus.BACKLOG)
    position: int = Field(default=0)


class TodoUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=2000)
    status: TodoStatus
    position: int | None = Field(default=None)


class TodoOut(BaseModel):
    id: int
    title: str
    description: str
    status: str
    position: int
    created_at: str
    updated_at: str


@app.get("/api/todos")
def list_todos(status: TodoStatus | None = None):
    todos = container.query_handler.get_all(status)
    return [t.__dict__ for t in todos]


@app.get("/api/todos/board")
def board():
    return container.query_handler.get_board()


@app.get("/api/todos/{todo_id}", response_model=TodoOut)
def get_todo(todo_id: int):
    try:
        todo = container.query_handler.get_by_id(todo_id)
        return todo.__dict__
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.post("/api/todos", status_code=201)
def create_todo(payload: TodoCreate):
    cmd = CreateTodoCommand(
        title=payload.title,
        description=payload.description,
        status=payload.status,
        position=payload.position,
    )
    result = container.command_handler.handle_create(cmd)
    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)
    return result.to_dict()


@app.put("/api/todos/{todo_id}")
def update_todo(todo_id: int, payload: TodoUpdate):
    cmd = UpdateTodoCommand(
        todo_id=todo_id,
        title=payload.title,
        description=payload.description,
        status=payload.status,
        position=payload.position,
    )
    result = container.command_handler.handle_update(cmd)
    if not result.success:
        raise HTTPException(status_code=404, detail=result.error)
    return result.to_dict()


@app.delete("/api/todos/{todo_id}")
def delete_todo(todo_id: int):
    cmd = DeleteTodoCommand(todo_id=todo_id)
    result = container.command_handler.handle_delete(cmd)
    if not result.success:
        raise HTTPException(status_code=404, detail=result.error)
    return result.to_dict()
