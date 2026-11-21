"""Ambulance model."""

from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import Float, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AmbulanceStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    DISPATCHED = "DISPATCHED"
    EN_ROUTE = "EN_ROUTE"
    AT_SCENE = "AT_SCENE"
    RETURNING = "RETURNING"
    MAINTENANCE = "MAINTENANCE"


class AmbulanceType(str, enum.Enum):
    BLS = "BLS"
    ALS = "ALS"
    MORTUARY = "MORTUARY"


class Ambulance(Base):
    __tablename__ = "ambulances"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    vehicle_number: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False
    )
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default=AmbulanceStatus.AVAILABLE.value
    )
    ambulance_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default=AmbulanceType.BLS.value
    )
    driver_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    driver_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    capacity: Mapped[int] = mapped_column(Integer, default=2)
    assigned_incident_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("incidents.id"), nullable=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now(), nullable=False
    )
