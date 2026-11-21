"""WebSocket router for live disaster telemetry, GPS, and agent feeds."""

from __future__ import annotations

import asyncio
import json
from typing import Dict, List

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["WebSocket Real-Time Feed"])


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict) -> None:
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)


manager = ConnectionManager()


@router.websocket("/ws")
@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str = "web-client"):
    await manager.connect(websocket)
    try:
        # Send initial handshake welcome
        await websocket.send_json({
            "type": "CONNECTION_ESTABLISHED",
            "client_id": client_id,
            "status": "CONNECTED_TO_SAVE_LIVE_TELEMETRY"
        })
        while True:
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
                # Echo or broadcast client actions (e.g. GPS ping)
                if payload.get("type") == "PING":
                    await websocket.send_json({"type": "PONG"})
                else:
                    await manager.broadcast({"type": "EVENT_BROADCAST", "sender": client_id, "data": payload})
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
