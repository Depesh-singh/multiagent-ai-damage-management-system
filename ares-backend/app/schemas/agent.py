"""Agent, run, approval, and situation report schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class AgentRunResponse(BaseModel):
    id: Any
    incident_id: Any
    agent_name: str
    agent_type: str
    task: str
    status: str
    input_data: Optional[Dict[str, Any]] = None
    output_data: Optional[Dict[str, Any]] = None
    recommendation: Optional[str] = None
    confidence: Optional[float] = None
    source: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ApprovalDecision(BaseModel):
    action: str  # APPROVE, REJECT, MODIFY
    decision_notes: Optional[str] = None


class ApprovalResponse(BaseModel):
    id: Any
    incident_id: Any
    action_type: str
    action_description: str
    proposed_by: str
    status: str
    decided_by: Optional[str] = None
    decision_notes: Optional[str] = None
    created_at: Optional[datetime] = None
    decided_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ResponsePlanResponse(BaseModel):
    incident_id: str
    status: str
    orchestrated_at: str
    execution_duration_seconds: float
    detection: Dict[str, Any]
    verification: Dict[str, Any]
    risk_assessment: Dict[str, Any]
    hospital_allocation: Dict[str, Any]
    ambulance_dispatch: Dict[str, Any]
    rescue_coordination: Dict[str, Any]
    medical_supplies: Dict[str, Any]
    route_optimization: Dict[str, Any]
    communications: Dict[str, Any]
    situation_report: Dict[str, Any]
    recommendations_summary: List[str]
    pending_approval_id: Optional[str] = None
