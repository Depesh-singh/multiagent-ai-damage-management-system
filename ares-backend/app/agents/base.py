"""Base agent class for ARES multi-agent system."""

from __future__ import annotations

import abc
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session


@dataclass
class AgentResult:
    """Standardised output returned by every agent."""

    status: str  # "success", "partial", "failed"
    output_data: dict[str, Any] = field(default_factory=dict)
    recommendation: Optional[str] = None
    confidence: Optional[float] = None
    source: Optional[str] = None
    error_message: Optional[str] = None


class BaseAgent(abc.ABC):
    """Abstract base every specialist agent inherits from."""

    agent_id: str
    agent_name: str
    agent_type: str  # e.g. "DETECTION", "HOSPITAL_ALLOCATION"

    def __init__(self) -> None:
        self.agent_id = str(uuid.uuid4())

    # ── abstract entry-point ───────────────────────────────────
    @abc.abstractmethod
    async def execute(
        self, incident_id: str, input_data: dict[str, Any]
    ) -> AgentResult:
        ...

    # ── DB helpers ─────────────────────────────────────────────
    @staticmethod
    async def _get_db_session() -> AsyncSession:
        """Return a fresh async session (caller must close / use as context)."""
        return async_session()

    async def _log_run(
        self,
        db: AsyncSession,
        incident_id: str,
        input_data: dict[str, Any],
        result: AgentResult,
        started_at: datetime,
    ) -> None:
        """Create an AgentRun record in the database."""
        from app.models.agent import AgentRun  # local import avoid circular

        inc_uuid = uuid.UUID(str(incident_id)) if incident_id else uuid.uuid4()
        run = AgentRun(
            id=uuid.uuid4(),
            incident_id=inc_uuid,
            agent_name=self.agent_name,
            agent_type=self.agent_type,
            task=f"{self.agent_name} execution",
            status="COMPLETED" if result.status == "success" else "FAILED",
            input_data=input_data,
            output_data=result.output_data,
            recommendation=result.recommendation,
            confidence=result.confidence,
            source=result.source,
            error_message=result.error_message,
            started_at=started_at,
            completed_at=datetime.now(timezone.utc),
        )
        db.add(run)
        await db.flush()
