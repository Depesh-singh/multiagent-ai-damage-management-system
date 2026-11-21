"""SAVE — Strategic Agent-Based Victim Evacuation — FastAPI application."""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
import app.models  # Ensure all models are registered

# Import routers
from app.routers import (
    agents,
    ambulances,
    auth,
    communication,
    hospitals,
    incidents,
    medical,
    reports,
    rescue,
    shelters,
    simulation,
    websocket,
)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    """Create tables on startup; yield; cleanup on shutdown."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="SAVE — Strategic Agent-Based Victim Evacuation",
    description="Mission Control, Multi-Agent Coordination, and Emergency Response Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ───────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register Routers under /api/v1 ──────────────────────────────
API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(incidents.router, prefix=API_PREFIX)
app.include_router(hospitals.router, prefix=API_PREFIX)
app.include_router(ambulances.router, prefix=API_PREFIX)
app.include_router(rescue.router, prefix=API_PREFIX)
app.include_router(medical.router, prefix=API_PREFIX)
app.include_router(communication.router, prefix=API_PREFIX)
app.include_router(agents.router, prefix=API_PREFIX)
app.include_router(shelters.router, prefix=API_PREFIX)
app.include_router(reports.router, prefix=API_PREFIX)
app.include_router(simulation.router, prefix=API_PREFIX)
app.include_router(websocket.router, prefix=API_PREFIX)

# Also expose without prefix for convenience
app.include_router(auth.router)
app.include_router(incidents.router)
app.include_router(hospitals.router)
app.include_router(ambulances.router)
app.include_router(rescue.router)
app.include_router(medical.router)
app.include_router(communication.router)
app.include_router(agents.router)
app.include_router(shelters.router)
app.include_router(reports.router)
app.include_router(simulation.router)
app.include_router(websocket.router)


from datetime import datetime, timezone
from sqlalchemy import text
from app.core.database import async_session


@app.get("/health")
@app.get("/api/v1/health")
async def health():
    db_status = "disconnected"
    try:
        async with async_session() as session:
            await session.execute(text("SELECT 1"))
            db_status = "connected"
    except Exception as exc:
        db_status = f"error: {str(exc)}"

    return {
        "service": "SAVE — Strategic Agent-Based Victim Evacuation",
        "status": "healthy" if db_status == "connected" else "degraded",
        "version": "1.0.0",
        "agents": 10,
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ── Serve Built Frontend SPA ────────────────────────────────────
import os
from fastapi.staticfiles import StaticFiles

frontend_dist = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "ares-frontend",
    "dist"
)
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")

