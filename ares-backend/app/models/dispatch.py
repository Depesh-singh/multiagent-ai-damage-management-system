"""Dispatch model."""

from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class DispatchType(str, enum.Enum):
    AMBULANCE = "AMBULANCE"
    RESCUE = "RESCUE"
    SUPPLY = "SUPPLY"


class DispatchStatus(str, enum.Enum):
    PLANNED = "PLANNED"
    APPROVED = "APPROVED"
    DISPATCHED = "DISPATCHED"
    EN_ROUTE = "EN_ROUTE"
    ARRIVED = "ARRIVED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class Dispatch(Base):
    __tablename__ = "dispatches"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    incident_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("incidents.id"), nullable=False, index=True
    )
    ambulance_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("ambulances.id"), nullable=True
    )
    rescue_team_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("rescue_teams.id"), nullable=True
    )
    dispatch_type: Mapped[str] = mapped_column(String(50), nullable=False)
    destination_lat: Mapped[float] = mapped_column(Float, nullable=False)
    destination_lng: Mapped[float] = mapped_column(Float, nullable=False)
    destination_name: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default=DispatchStatus.PLANNED.value
    )
    eta_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    route_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    dispatched_at: Mapped[datetime | None] = mapped_column(nullable=True)
    arrived_at: Mapped[datetime | None] = mapped_column(nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(nullable=True)
    dispatched_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
