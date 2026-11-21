"""Pydantic schemas for ARES API."""

from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.schemas.common import (
    GeoPoint,
    PaginatedResponse,
    PaginationParams,
    StatusResponse,
)
from app.schemas.incident import (
    DisasterCreate,
    DisasterResponse,
    IncidentCreate,
    IncidentResponse,
    IncidentStatusUpdate,
)
from app.schemas.hospital import (
    HospitalCreate,
    HospitalCapacityUpdate,
    HospitalResponse,
)
from app.schemas.ambulance import (
    AmbulanceCreate,
    AmbulanceResponse,
    AmbulanceUpdate,
)
from app.schemas.rescue import (
    MissionCreate,
    MissionResponse,
    RescueTeamCreate,
    RescueTeamResponse,
)
from app.schemas.medical import (
    MedicalInventoryItem,
    SupplyRequestCreate,
    SupplyRequestResponse,
)
from app.schemas.communication import (
    AgencyMessageCreate,
    AgencyMessageResponse,
)
from app.schemas.agent import (
    AgentRunResponse,
    ApprovalDecision,
    ApprovalResponse,
    ResponsePlanResponse,
)
from app.schemas.shelter import (
    ShelterCreate,
    ShelterResponse,
)

__all__ = [
    "LoginRequest",
    "RegisterRequest",
    "TokenResponse",
    "UserResponse",
    "GeoPoint",
    "PaginatedResponse",
    "PaginationParams",
    "StatusResponse",
    "DisasterCreate",
    "DisasterResponse",
    "IncidentCreate",
    "IncidentResponse",
    "IncidentStatusUpdate",
    "HospitalCreate",
    "HospitalCapacityUpdate",
    "HospitalResponse",
    "AmbulanceCreate",
    "AmbulanceResponse",
    "AmbulanceUpdate",
    "MissionCreate",
    "MissionResponse",
    "RescueTeamCreate",
    "RescueTeamResponse",
    "MedicalInventoryItem",
    "SupplyRequestCreate",
    "SupplyRequestResponse",
    "AgencyMessageCreate",
    "AgencyMessageResponse",
    "AgentRunResponse",
    "ApprovalDecision",
    "ApprovalResponse",
    "ResponsePlanResponse",
    "ShelterCreate",
    "ShelterResponse",
]
