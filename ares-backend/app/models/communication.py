"""AgencyMessage model for inter-agency communication."""

from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class MessageType(str, enum.Enum):
    ALERT = "ALERT"
    REQUEST = "REQUEST"
    UPDATE = "UPDATE"
    ACKNOWLEDGMENT = "ACKNOWLEDGMENT"
    ESCALATION = "ESCALATION"


class MessageStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SENT = "SENT"
    DELIVERED = "DELIVERED"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    FAILED = "FAILED"


class MessagePriority(str, enum.Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class AgencyMessage(Base):
    __tablename__ = "agency_messages"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    incident_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("incidents.id"), nullable=True, index=True
    )
    sender_role: Mapped[str] = mapped_column(String(50), nullable=False)
    sender_name: Mapped[str] = mapped_column(String(255), nullable=False)
    recipient_agency: Mapped[str | None] = mapped_column(String(255), nullable=True)
    recipient_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    recipient_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    message_type: Mapped[str] = mapped_column(String(50), nullable=False)
    subject: Mapped[str | None] = mapped_column(String(500), nullable=True)
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default=MessageStatus.DRAFT.value
    )
    priority: Mapped[str] = mapped_column(
        String(50), nullable=False, default=MessagePriority.MEDIUM.value
    )
    sent_at: Mapped[datetime | None] = mapped_column(nullable=True)
    acknowledged_at: Mapped[datetime | None] = mapped_column(nullable=True)
    escalation_level: Mapped[int] = mapped_column(Integer, default=0)
    parent_message_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("agency_messages.id"),
        nullable=True,
    )
