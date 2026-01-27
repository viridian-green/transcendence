import { useEffect, useRef, useState, useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'game_invite' | 'game_start' | 'game_end' | 'message' | 'system';
  title: string;
  message: string;
  userId: string;
  fromUserId?: string;
  fromUsername?: string;
  read: boolean;
  createdAt: string | Date;
  metadata?: Record<string, any>;
}

export interface NotificationSocketMessage {
  type: 'welcome' | 'notification' | 'pending_notifications' | 'notification_read' | 'all_notifications_read' | 'notifications_list' | 'GAME_START' | 'error';
  message?: string;
  user?: { id: string; username: string };
  payload?: Notification;
  count?: number;
  notifications?: Notification[];
  notificationId?: string;
}

export function useNotificationSocket(enabled: boolean) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled) {
      console.log('[NOTIFICATION SOCKET] disabled');
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
     const wsUrl = `${protocol}//${window.location.host}/api/notifications/websocket`;
    console.log('[NOTIFICATION SOCKET] connecting to', wsUrl);

    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => {
      console.log('[NOTIFICATION SOCKET] connected');
      setIsConnected(true);
    };

    socket.onclose = (event) => {
      console.log('[NOTIFICATION SOCKET] closed', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
        readyState: socket.readyState,
      });
      setIsConnected(false);
    };

    socket.onerror = (err) => {
      console.error('[NOTIFICATION SOCKET] error', err);
      setIsConnected(false);
    };

    socket.onmessage = (event) => {
      console.log('[NOTIFICATION SOCKET] raw message', event.data);
      try {
        const data: NotificationSocketMessage = JSON.parse(event.data);

        switch (data.type) {
          case 'welcome':
            console.log('[NOTIFICATION SOCKET]', data.message);
            break;

          case 'notification':
            if (data.payload) {
              setNotifications((prev) => [data.payload!, ...prev]);
              setUnreadCount((prev) => prev + 1);
            }
            break;

             case 'GAME_START':
            if (data.payload) {
              setNotifications((prev) => [data.payload!, ...prev]);
              setUnreadCount((prev) => prev + 1);
            }
            break;

          case 'pending_notifications':
            if (data.notifications) {
              setNotifications(data.notifications);
              const unread = data.notifications.filter(n => !n.read).length;
              setUnreadCount(unread);
            }
            break;

          case 'notification_read':
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === data.notificationId ? { ...n, read: true } : n
              )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
            break;

          case 'all_notifications_read':
            setNotifications((prev) =>
              prev.map((n) => ({ ...n, read: true }))
            );
            setUnreadCount(0);
            break;

          case 'notifications_list':
            if (data.notifications) {
              setNotifications(data.notifications);
              const unread = data.notifications.filter(n => !n.read).length;
              setUnreadCount(unread);
            }
            break;

          case 'error':
            console.error('[NOTIFICATION SOCKET] error:', data.message);
            break;

          default:
            console.log('[NOTIFICATION SOCKET] unknown message type:', data.type);
        }
      } catch (parseError) {
        console.error('[NOTIFICATION SOCKET] parse error:', parseError);
      }
    };

    return () => {
      console.log('[NOTIFICATION SOCKET] cleanup (effect unmounting)');
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
      ws.current = null;
    };
  }, [enabled]);

  const send = useCallback((payload: unknown) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.warn('[NOTIFICATION SOCKET] cannot send, socket state:',
        ws.current?.readyState,
        'payload:', payload
      );
      return;
    }
    console.log('[NOTIFICATION SOCKET] sending', payload);
    ws.current.send(
      typeof payload === 'string' ? payload : JSON.stringify(payload)
    );
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    send({ type: 'mark_read', notificationId });
  }, [send]);

  const markAllAsRead = useCallback(() => {
    send({ type: 'mark_all_read' });
  }, [send]);

  const getNotifications = useCallback(() => {
    send({ type: 'get_notifications' });
  }, [send]);

  return {
  notifications,
  isConnected,
  unreadCount,
  markAsRead,
  markAllAsRead,
  getNotifications,
  send,
};

}

