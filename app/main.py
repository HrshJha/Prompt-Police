from fastapi import FastAPI

from app.api.routes import router as prediction_router
from app.utils.config import get_settings
from app.utils.logging import configure_logging


configure_logging()
settings = get_settings()

app = FastAPI(
    title="Prompt Police",
    version="1.0.0",
    description="Real-time jailbreak prompt detection service for LLM applications.",
)

app.include_router(prediction_router, prefix=settings.api_prefix)


@app.get("/", tags=["root"])
def root() -> dict:
    return {
        "service": "Prompt Police",
        "status": "ok",
        "endpoints": {
            "health": "/healthz",
            "predict": "/predict",
            "docs": "/docs",
        },
    }


@app.get("/healthz", tags=["health"])
def healthcheck() -> dict:
    return {"status": "ok"}
