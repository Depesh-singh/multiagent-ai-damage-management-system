"""Disaster, Incident, and IncidentReport models."""

from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    Boolean,
    func,
)
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


# ── Enums ──────────────────────────────────────────────────────
class DisasterType(str, enum.Enum):
    EARTHQUAKE = "EARTHQUAKE"
    FLOOD = "FLOOD"
    FIRE = "FIRE"
    ACCIDENT = "ACCIDENT"
    CYCLONE = "CYCLONE"
    LANDSLIDE = "LANDSLIDE"


class IncidentStatus(str, enum.Enum):
    REPORTED = "REPORTED"
    UNDER_VERIFICATION = "UNDER_VERIFICATION"
    TRIAGED = "TRIAGED"
    ACTIVE = "ACTIVE"
    RESPONSE_PLANNED = "RESPONSE_PLANNED"
    APPROVED = "APPROVED"
    DISPATCHED = "DISPATCHED"
    ON_SCENE = "ON_SCENE"
    RECOVERY = "RECOVERY"
    RESOLVED = "RESOLVED"


# ── Models ─────────────────────────────────────────────────────
class Disaster(Base):
    __tablename__ = "disasters"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    epicenter_lat: Mapped[float] = mapped_column(Float, nullable=False)
    epicenter_lng: Mapped[float] = mapped_column(Float, nullable=False)
    radius_km: Mapped[float] = mapped_column(Float, nullable=True)
    severity: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="ACTIVE")
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), nullable=False
    )
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    disaster_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("disasters.id"), nullable=True, index=True
    )
    location_lat: Mapped[float] = mapped_column(Float, nullable=False)
    location_lng: Mapped[float] = mapped_column(Float, nullable=False)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    casualty_estimate: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default=IncidentStatus.REPORTED.value
    )
    source: Mapped[str | None] = mapped_column(String(100), nullable=True)
    evidence_urls: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    verified_at: Mapped[datetime | None] = mapped_column(nullable=True)
    verified_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), nullable=False
    )


class IncidentReport(Base):
    __tablename__ = "incident_reports"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    incident_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("incidents.id"), nullable=False, index=True
    )
    reporter_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    reporter_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    media_urls: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    source_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    is_duplicate: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), nullable=False
    )
