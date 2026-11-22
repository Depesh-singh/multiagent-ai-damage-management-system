"""n8n Multi-Agent Orchestrator Integration Service.

Connects the SAVE platform directly to the active n8n instance running in Docker on port 5678.
Dispatches real emergency incidents to the active multi-agent pipeline and broadcasts results.
"""

from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional
import httpx

from app.core.config import settings
from app.core.database import async_session
from app.core.utils import as_uuid
from app.models.agent import AuditLog
from app.models.incident import Incident, IncidentStatus
from app.routers.websocket import manager

logger = logging.getLogger("ares.n8n")


class N8nService:
    """Service to communicate with n8n multi-agent engine."""

    def __init__(self) -> None:
        self.base_url = settings.N8N_BASE_URL.rstrip("/")
        self.webhook_url = settings.N8N_WEBHOOK_URL
        self.event_webhook_url = settings.N8N_EVENT_WEBHOOK_URL

    async def get_status(self) -> Dict[str, Any]:
        """Check connection to local n8n instance on port 5678."""
        status = {
            "connected": False,
            "port": 5678,
            "base_url": self.base_url,
            "webhook_url": self.webhook_url,
            "event_webhook_url": self.event_webhook_url,
            "workflow_name": "ARES — Multi-Agent Orchestrator (v2)",
            "workflow_id": "aresMagent202601",
            "active": True,
            "error": None,
        }
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(f"{self.base_url}/healthz")
                if res.status_code == 200:
                    status["connected"] = True
                else:
                    status["error"] = f"HTTP {res.status_code}"
        except Exception as exc:
            status["error"] = str(exc)

        return status

    async def dispatch_emergency(
        self,
        incident_id: str,
        disaster_type: str = "FLOOD",
        latitude: float = 22.5620,
        longitude: float = 88.3639,
        location_name: str = "Central Operations Area",
        casualty_estimate: int = 10,
        description: str = "Real-time emergency incident requiring multi-agent response.",
        reporter_source: str = "ERSS_112",
        simulated: bool = False,
    ) -> Dict[str, Any]:
        """Trigger n8n's Multi-Agent Orchestrator workflow with a real incident payload."""
        payload = {
            "incident_id": str(incident_id),
            "disaster_type": str(disaster_type).upper(),
            "latitude": float(latitude),
            "longitude": float(longitude),
            "location_name": str(location_name),
            "casualty_estimate": int(casualty_estimate or 0),
            "description": str(description),
            "reporter_source": str(reporter_source),
            "simulated": bool(simulated),
        }

        logger.info("Dispatching incident to n8n webhook: %s", self.webhook_url)

        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                res = await client.post(self.webhook_url, json=payload)
                if res.status_code not in (200, 201):
                    raise RuntimeError(
                        f"n8n returned HTTP {res.status_code}: {res.text}"
                    )
                n8n_data = res.json()
        except Exception as exc:
            logger.error("Failed to call n8n webhook: %s", exc)
            return {
                "success": False,
                "error": f"n8n call failed: {str(exc)}",
                "webhook_url": self.webhook_url,
                "fallback_mode": "manual",
            }

        # Update Incident in DB if it exists
        async with async_session() as db:
            result = await db.execute(
                Incident.__table__.select().where(Incident.id == as_uuid(incident_id))
            )
            row = result.first()
            if row:
                # Log audit
                audit = AuditLog(
                    id=uuid.uuid4(),
                    action="N8N_MULTI_AGENT_DISPATCHED",
                    resource_type="INCIDENT",
                    resource_id=str(incident_id),
                    new_value={
                        "n8n_mode": n8n_data.get("mode"),
                        "stage": n8n_data.get("result", {}).get("stage"),
                        "response_plan_summary": n8n_data.get("response_plan", {}).get(
                            "response_summary"
                        ),
                    },
                )
                db.add(audit)
                await db.commit()

        # Broadcast real-time update to WebSocket clients
        await manager.broadcast(
            {
                "type": "N8N_MULTI_AGENT_PLAN_READY",
                "incident_id": str(incident_id),
                "data": n8n_data,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        )

        return n8n_data

    async def trigger_event(
        self,
        event_type: str,
        incident_id: str,
        details: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Trigger n8n's Event-Driven Reassessment Webhook."""
        payload = {
            "event_type": event_type,
            "incident_id": str(incident_id),
            "details": details or {},
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(self.event_webhook_url, json=payload)
                return res.json()
        except Exception as exc:
            logger.error("Failed to trigger n8n event webhook: %s", exc)
            return {"success": False, "error": str(exc)}


n8n_service = N8nService()
