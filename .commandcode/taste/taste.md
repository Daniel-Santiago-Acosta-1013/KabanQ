# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# python
- Prefer FastAPI + Pydantic v2 over Flask for Python backends. Confidence: 0.50
- Do not use ORMs for database interactions. Confidence: 0.70
- Python backends managed with uv should not have a `package.json`; use only pyproject.toml + uv. Confidence: 0.65

# package-manager
- Use bun as the default package manager. Confidence: 0.50
- Use uv exclusively for Python dependency management (not pip, not venv, not `--system`). Confidence: 0.85
