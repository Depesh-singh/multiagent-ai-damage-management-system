import { useEffect, useRef, useState } from 'react';

export interface WebSocketMessage {
  type: string;
  sender?: string;
  data?: any;
  client_id?: string;
  status?: string;
  timestamp?: string;
}

export function useAresWebSocket(onEvent?: (msg: WebSocketMessage) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  useEffect(() => {
    let unmounted = false;

    function connect() {
      if (unmounted) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // If running via Vite dev server proxy or direct
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (unmounted) return;
          setIsConnected(true);
          console.log('[ARES WebSocket] Connected to real-time telemetry stream');
        };

        ws.onmessage = (event) => {
          if (unmounted) return;
          try {
            const data: WebSocketMessage = JSON.parse(event.data);
            setLastMessage(data);
            if (onEvent) onEvent(data);
          } catch (e) {
            console.warn('[ARES WebSocket] Parse error:', e);
          }
        };

        ws.onclose = () => {
          if (unmounted) return;
          setIsConnected(false);
          // Auto reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          if (unmounted) return;
          setIsConnected(false);
          ws.close();
        };
      } catch (err) {
        console.warn('[ARES WebSocket] Connection failure:', err);
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      }
    }

    connect();

    return () => {
      unmounted = true;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  const send = (data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  };

  return { isConnected, lastMessage, send };
}
