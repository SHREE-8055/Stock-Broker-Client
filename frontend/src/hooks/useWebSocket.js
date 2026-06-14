import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook that manages a WebSocket connection with auto-reconnect.
 *
 * @param {string}   url
 * @param {object}   handlers  - { onOpen, onClose, onMessage, onError }
 * @returns {{ sendMessage }}
 */
export default function useWebSocket(url, { onOpen, onClose, onMessage, onError } = {}) {
  const wsRef        = useRef(null);
  const reconnectRef = useRef(null);
  const mountedRef   = useRef(true);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
      onOpen?.();
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        onMessage?.(msg);
      } catch {
        // ignore non-JSON frames
      }
    };

    ws.onclose = () => {
      onClose?.();
      // Auto-reconnect after 2 s
      if (mountedRef.current) {
        reconnectRef.current = setTimeout(connect, 2000);
      }
    };

    ws.onerror = (err) => {
      onError?.(err);
      ws.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  return { sendMessage };
}
