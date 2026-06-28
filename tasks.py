"""Invoke tasks for KabanQ monorepo operations.

Requires:
    - uv (Python environment manager)
    - bun (frontend package manager)
    - AWS CDK CLI (`npm install -g aws-cdk`)
    - Docker (for backend image builds)
    - AWS credentials configured

Usage:
    uv run inv --list
    uv run inv synth
    uv run inv deploy-infra
"""
from __future__ import annotations

import os
from pathlib import Path

from invoke import task

ROOT = Path(__file__).resolve().parent
BACKEND_DIR = ROOT / "apps" / "backend"
FRONTEND_DIR = ROOT / "apps" / "frontend"
INFRA_DIR = ROOT / "infra"


def _run(c, cmd: str, *, cwd: Path | None = None) -> None:
    """Run a shell command, optionally from a specific directory."""
    with c.cd(str(cwd)) if cwd else c:
        c.run(cmd, pty=True)


# ---------------------------------------------------------------------------
# Local development
# ---------------------------------------------------------------------------


@task
def dev(c):
    """Run backend and frontend locally (requires PostgreSQL running)."""
    _run(c, "docker compose up --build", cwd=ROOT)


@task
def dev_down(c):
    """Stop local Docker Compose environment."""
    _run(c, "docker compose down", cwd=ROOT)


# ---------------------------------------------------------------------------
# Backend
# ---------------------------------------------------------------------------


@task
def test_backend(c):
    """Compile backend Python files to catch syntax errors."""
    files = " ".join(
        str(p.relative_to(BACKEND_DIR))
        for p in BACKEND_DIR.rglob("*.py")
        if "__pycache__" not in p.parts
    )
    _run(
        c,
        f"uv run --python 3.13 python -m py_compile {files}",
        cwd=BACKEND_DIR,
    )


@task
def build_backend(c, tag: str | None = None):
    """Build the backend Docker image."""
    image_tag = tag or os.environ.get("BACKEND_IMAGE_TAG", "latest")
    _run(
        c,
        f"docker build -t kabanq-backend:{image_tag} .",
        cwd=BACKEND_DIR,
    )


@task(pre=[test_backend, build_backend])
def deploy_backend(c):
    """Build, push and deploy the backend service.

    Expects AWS credentials and the CDK CLI to be available.
    """
    sha = os.environ.get("GITHUB_SHA", "local")
    _run(c, "uv run --python 3.13 python app.py", cwd=INFRA_DIR)
    _run(
        c,
        "cdk deploy KabanqBackendStack --require-approval never",
        cwd=INFRA_DIR,
    )
    _run(
        c,
        (
            "REPOSITORY_URL=$(aws ecr describe-repositories "
            "--repository-names kabanq-backend "
            "--query 'repositories[0].repositoryUri' --output text) "
            f"&& IMAGE_URI=\"${{REPOSITORY_URL}}:{sha}\" "
            "&& docker build -t \"${IMAGE_URI}\" . "
            "&& docker tag \"${IMAGE_URI}\" \"${REPOSITORY_URL}:latest\" "
            "&& docker push \"${IMAGE_URI}\" "
            "&& docker push \"${REPOSITORY_URL}:latest\""
        ),
        cwd=BACKEND_DIR,
    )
    _run(
        c,
        f"BACKEND_IMAGE_URI=$(aws ecr describe-repositories --repository-names kabanq-backend --query 'repositories[0].repositoryUri' --output text):{sha} "
        "cdk deploy KabanqBackendStack --require-approval never",
        cwd=INFRA_DIR,
    )


# ---------------------------------------------------------------------------
# Frontend
# ---------------------------------------------------------------------------


@task
def test_frontend(c):
    """Build the frontend to catch TypeScript and build errors."""
    _run(c, "bun install --frozen-lockfile", cwd=ROOT)
    _run(c, "bun run build", cwd=FRONTEND_DIR)


@task(pre=[test_frontend])
def deploy_frontend(c):
    """Build and deploy the frontend static site."""
    _run(
        c,
        "cdk deploy KabanqFrontendStack --require-approval never --outputs-file cdk-outputs.json",
        cwd=INFRA_DIR,
    )
    _run(
        c,
        (
            "BUCKET_NAME=$(python -c \"import json; v=list(json.load(open('cdk-outputs.json')).values())[0]; print(v['BucketName'])\") "
            "&& DISTRIBUTION_ID=$(python -c \"import json; v=list(json.load(open('cdk-outputs.json')).values())[0]; print(v['DistributionId'])\") "
            "&& aws s3 sync dist \"s3://${BUCKET_NAME}\" --delete "
            "&& aws cloudfront create-invalidation --distribution-id \"${DISTRIBUTION_ID}\" --paths \"/*\""
        ),
        cwd=FRONTEND_DIR,
    )


# ---------------------------------------------------------------------------
# Infrastructure (IAC)
# ---------------------------------------------------------------------------


@task
def synth(c):
    """Synthesize all CDK stacks into cdk.out/."""
    _run(c, "uv run --python 3.13 python app.py", cwd=INFRA_DIR)


@task
def bootstrap(c):
    """Bootstrap the AWS account/region for CDK deployments."""
    _run(c, "cdk bootstrap", cwd=INFRA_DIR)


@task(pre=[synth])
def diff(c):
    """Show CloudFormation diff for all stacks (cdk diff)."""
    _run(c, "cdk diff", cwd=INFRA_DIR)


@task(pre=[synth])
def plan(c):
    """Alias for diff: plan infrastructure changes."""
    diff(c)


@task(pre=[synth, bootstrap])
def deploy_infra(c):
    """Deploy all CDK stacks (full infrastructure)."""
    _run(c, "cdk deploy --all --require-approval never", cwd=INFRA_DIR)


@task(pre=[deploy_infra])
def deploy_all(c):
    """Deploy backend and frontend after infrastructure is ready."""
    deploy_backend(c)
    deploy_frontend(c)


@task
def destroy_dev(c, confirm: str = ""):
    """Destroy all CDK stacks. Requires confirmation='destroy kabanq dev'."""
    if confirm != "destroy kabanq dev":
        print("Destructive action requires: --confirm='destroy kabanq dev'")
        raise SystemExit(1)
    _run(c, "cdk destroy --all --force", cwd=INFRA_DIR)


@task(pre=[synth])
def validate(c):
    """Synthesize and validate templates without deploying."""
    print("Templates synthesized in infra/cdk.out/")
    print("Run 'uv run inv diff' to review planned changes.")
