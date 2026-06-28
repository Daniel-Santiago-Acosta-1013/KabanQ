"""FastAPI routes exposing issue management API."""
from datetime import date
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from ..commands.issue_commands import (
    CreateIssueCommand,
    DeleteIssueCommand,
    UpdateIssueCommand,
)
from ..database import init_db
from ..di.container import container
from ..models.priority import Priority

app = FastAPI(title="KabanQ API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------


class IssueCreate(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    description: str = Field(default="", max_length=10000)
    status_id: int | None = Field(default=None)
    priority: Priority = Field(default=Priority.MEDIUM)
    position: int = Field(default=0)
    due_date: date | None = Field(default=None)
    estimate: int | None = Field(default=None, ge=0)
    project_id: int | None = Field(default=None)
    cycle_id: int | None = Field(default=None)
    parent_id: int | None = Field(default=None)
    label_ids: list[int] = Field(default_factory=list)
    custom_field_values: list[dict[str, Any]] = Field(default_factory=list)


class IssueUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=500)
    description: str | None = Field(default=None, max_length=10000)
    status_id: int | None = Field(default=None)
    priority: Priority | None = Field(default=None)
    position: int | None = Field(default=None)
    due_date: date | None = Field(default=None)
    estimate: int | None = Field(default=None, ge=0)
    project_id: int | None = Field(default=None)
    cycle_id: int | None = Field(default=None)
    parent_id: int | None = Field(default=None)
    label_ids: list[int] | None = Field(default=None)
    custom_field_values: list[dict[str, Any]] | None = Field(default=None)


class StatusCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    slug: str = Field(min_length=1, max_length=100)
    color: str = Field(default="#94a3b8", max_length=7)
    position: int = Field(default=0)


class StatusUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    slug: str = Field(min_length=1, max_length=100)
    color: str = Field(max_length=7)
    position: int


class LabelCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    color: str = Field(default="#94a3b8", max_length=7)


class LabelUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    color: str = Field(max_length=7)


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=2000)
    color: str = Field(default="#6366f1", max_length=7)


class ProjectUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=2000)
    color: str = Field(max_length=7)


class CycleCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    start_date: date | None = Field(default=None)
    end_date: date | None = Field(default=None)


class CycleUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    start_date: date | None = Field(default=None)
    end_date: date | None = Field(default=None)


class CustomFieldCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    field_type: str = Field(default="text")
    options: str = Field(default="")


class CustomFieldUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    field_type: str
    options: str = Field(default="")


class RelationCreate(BaseModel):
    target_id: int
    relation_type: str = Field(min_length=1, max_length=50)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _issue_to_dict(issue) -> dict:
    d = issue.__dict__.copy()
    d["priority"] = issue.priority.value
    d["due_date"] = str(issue.due_date) if issue.due_date else None
    d["created_at"] = str(issue.created_at) if issue.created_at else None
    d["updated_at"] = str(issue.updated_at) if issue.updated_at else None
    return d


def _handle_result(result):
    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)
    return result.to_dict()


# ---------------------------------------------------------------------------
# Issues
# ---------------------------------------------------------------------------


@app.get("/api/issues")
def list_issues(
    status_id: int | None = None,
    project_id: int | None = None,
    cycle_id: int | None = None,
    label_ids: list[int] = Query(default=[]),
    priority: Priority | None = None,
    parent_id: int | None = None,
    due_before: date | None = None,
    due_after: date | None = None,
    q: str | None = None,
):
    issues = container.query_handler.get_all(
        status_id=status_id,
        project_id=project_id,
        cycle_id=cycle_id,
        label_ids=label_ids or None,
        priority=priority,
        parent_id=parent_id,
        due_before=due_before,
        due_after=due_after,
        query=q,
    )
    return [_issue_to_dict(i) for i in issues]


@app.get("/api/issues/board")
def board(
    project_id: int | None = None,
    cycle_id: int | None = None,
):
    return container.query_handler.get_board(project_id=project_id, cycle_id=cycle_id)


@app.get("/api/issues/inbox")
def inbox():
    issues = container.query_handler.get_inbox()
    return [_issue_to_dict(i) for i in issues]


@app.get("/api/issues/{issue_id}")
def get_issue(issue_id: int):
    try:
        issue = container.query_handler.get_by_id(issue_id)
        return _issue_to_dict(issue)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.post("/api/issues", status_code=201)
def create_issue(payload: IssueCreate):
    cmd = CreateIssueCommand(**payload.model_dump())
    result = container.command_handler.handle_create(cmd)
    return _handle_result(result)


@app.put("/api/issues/{issue_id}")
def update_issue(issue_id: int, payload: IssueUpdate):
    cmd = UpdateIssueCommand(issue_id=issue_id, **payload.model_dump())
    result = container.command_handler.handle_update(cmd)
    return _handle_result(result)


@app.delete("/api/issues/{issue_id}")
def delete_issue(issue_id: int):
    cmd = DeleteIssueCommand(issue_id=issue_id)
    result = container.command_handler.handle_delete(cmd)
    return _handle_result(result)


# ---------------------------------------------------------------------------
# Relations
# ---------------------------------------------------------------------------


@app.post("/api/issues/{issue_id}/relations")
def add_relation(issue_id: int, payload: RelationCreate):
    try:
        relation = container.issue_repository.add_relation(
            issue_id, payload.target_id, payload.relation_type
        )
        return relation
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.delete("/api/issues/relations/{relation_id}")
def remove_relation(relation_id: int):
    try:
        container.issue_repository.remove_relation(relation_id)
        return {"deleted": True}
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


# ---------------------------------------------------------------------------
# Statuses
# ---------------------------------------------------------------------------


@app.get("/api/statuses")
def list_statuses():
    return [s.__dict__ for s in container.status_repository.get_all()]


@app.post("/api/statuses", status_code=201)
def create_status(payload: StatusCreate):
    try:
        status = container.status_repository.create(
            name=payload.name,
            slug=payload.slug,
            color=payload.color,
            position=payload.position,
        )
        return status.__dict__
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.put("/api/statuses/{status_id}")
def update_status(status_id: int, payload: StatusUpdate):
    try:
        status = container.status_repository.update(
            status_id=status_id,
            name=payload.name,
            slug=payload.slug,
            color=payload.color,
            position=payload.position,
        )
        return status.__dict__
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.delete("/api/statuses/{status_id}")
def delete_status(status_id: int):
    try:
        container.status_repository.delete(status_id)
        return {"deleted": True}
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


# ---------------------------------------------------------------------------
# Labels
# ---------------------------------------------------------------------------


@app.get("/api/labels")
def list_labels():
    return [l.__dict__ for l in container.label_repository.get_all()]


@app.post("/api/labels", status_code=201)
def create_label(payload: LabelCreate):
    try:
        label = container.label_repository.create(name=payload.name, color=payload.color)
        return label.__dict__
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.put("/api/labels/{label_id}")
def update_label(label_id: int, payload: LabelUpdate):
    try:
        label = container.label_repository.update(
            label_id=label_id, name=payload.name, color=payload.color
        )
        return label.__dict__
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.delete("/api/labels/{label_id}")
def delete_label(label_id: int):
    try:
        container.label_repository.delete(label_id)
        return {"deleted": True}
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


# ---------------------------------------------------------------------------
# Projects
# ---------------------------------------------------------------------------


@app.get("/api/projects")
def list_projects():
    return [p.__dict__ for p in container.project_repository.get_all()]


@app.post("/api/projects", status_code=201)
def create_project(payload: ProjectCreate):
    project = container.project_repository.create(
        name=payload.name,
        description=payload.description,
        color=payload.color,
    )
    return project.__dict__


@app.put("/api/projects/{project_id}")
def update_project(project_id: int, payload: ProjectUpdate):
    try:
        project = container.project_repository.update(
            project_id=project_id,
            name=payload.name,
            description=payload.description,
            color=payload.color,
        )
        return project.__dict__
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.delete("/api/projects/{project_id}")
def delete_project(project_id: int):
    try:
        container.project_repository.delete(project_id)
        return {"deleted": True}
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


# ---------------------------------------------------------------------------
# Cycles
# ---------------------------------------------------------------------------


@app.get("/api/cycles")
def list_cycles():
    return [c.__dict__ for c in container.cycle_repository.get_all()]


@app.post("/api/cycles", status_code=201)
def create_cycle(payload: CycleCreate):
    cycle = container.cycle_repository.create(
        name=payload.name,
        start_date=payload.start_date,
        end_date=payload.end_date,
    )
    return cycle.__dict__


@app.put("/api/cycles/{cycle_id}")
def update_cycle(cycle_id: int, payload: CycleUpdate):
    try:
        cycle = container.cycle_repository.update(
            cycle_id=cycle_id,
            name=payload.name,
            start_date=payload.start_date,
            end_date=payload.end_date,
        )
        return cycle.__dict__
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.delete("/api/cycles/{cycle_id}")
def delete_cycle(cycle_id: int):
    try:
        container.cycle_repository.delete(cycle_id)
        return {"deleted": True}
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


# ---------------------------------------------------------------------------
# Custom fields
# ---------------------------------------------------------------------------


@app.get("/api/custom-fields")
def list_custom_fields():
    return [cf.__dict__ for cf in container.custom_field_repository.get_all()]


@app.post("/api/custom-fields", status_code=201)
def create_custom_field(payload: CustomFieldCreate):
    cf = container.custom_field_repository.create(
        name=payload.name,
        field_type=payload.field_type,
        options=payload.options,
    )
    return cf.__dict__


@app.put("/api/custom-fields/{custom_field_id}")
def update_custom_field(custom_field_id: int, payload: CustomFieldUpdate):
    try:
        cf = container.custom_field_repository.update(
            custom_field_id=custom_field_id,
            name=payload.name,
            field_type=payload.field_type,
            options=payload.options,
        )
        return cf.__dict__
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.delete("/api/custom-fields/{custom_field_id}")
def delete_custom_field(custom_field_id: int):
    try:
        container.custom_field_repository.delete(custom_field_id)
        return {"deleted": True}
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
