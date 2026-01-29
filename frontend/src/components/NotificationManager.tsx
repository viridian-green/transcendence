
import React, { useEffect, useState } from 'react';
import GlobalAlert from './GlobalAlert';
import { useNotificationSocket } from '@/hooks/useNotificationSocket';

const NotificationManager: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [alertProps, setAlertProps] = useState<any>(null);
  const { lastRawMessage } = useNotificationSocket(true);

  useEffect(() => {
    if (!lastRawMessage) return;
    if (lastRawMessage.type === 'FRIEND_INVITE_RECEIVED') {
      const userId = lastRawMessage.fromUserId;
      setAlertProps({
        message: `${lastRawMessage.fromUsername} sent you a friend invite!`,
        visible: true,
        type: 'received',
        acceptText: 'Accept',
        declineText: 'Decline',
        onAccept: async () => {
          try {
            const res = await fetch(`/api/users/friends/${userId}/accept`, {
              method: 'POST',
              credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to accept friend invite');
            setAlertProps((prev: any) => ({ ...prev, message: 'Friend invite accepted!' }));
          } catch (err) {
            setAlertProps((prev: any) => ({ ...prev, message: err instanceof Error ? err.message : 'Unknown error' }));
          } finally {
            setTimeout(() => setVisible(false), 1200);
          }
        },
        onDecline: async () => {
          try {
            const res = await fetch(`/api/users/friends/${userId}/reject`, {
              method: 'POST',
              credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to reject friend invite');
            setAlertProps((prev: any) => ({ ...prev, message: 'Friend invite rejected.' }));
          } catch (err) {
            setAlertProps((prev: any) => ({ ...prev, message: err instanceof Error ? err.message : 'Unknown error' }));
          } finally {
            setTimeout(() => setVisible(false), 1200);
          }
        },
        onClose: () => setVisible(false),
      });
      setVisible(true);
    } else if (lastRawMessage.type === 'GAME_INVITE_RECEIVED') {
      const userId = lastRawMessage.fromUserId;
      setAlertProps({
        message: `${lastRawMessage.fromUsername} invites you to play ${lastRawMessage.gameMode || 'pong'}!`,
        visible: true,
        type: 'received',
        acceptText: 'Accept',
        declineText: 'Decline',
        onAccept: () => {
          // Send accept via WebSocket if needed
          if (window.notificationSocket && window.notificationSocket.readyState === 1) {
            window.notificationSocket.send(JSON.stringify({
              type: 'INVITE_ACCEPT',
              fromUserId: userId,
            }));
          }
          setAlertProps((prev: any) => ({ ...prev, message: 'Game invite accepted!' }));
          setTimeout(() => setVisible(false), 1200);
        },
        onDecline: () => {
          // Optionally send decline via WebSocket
          setAlertProps((prev: any) => ({ ...prev, message: 'Game invite declined.' }));
          setTimeout(() => setVisible(false), 1200);
        },
        onClose: () => setVisible(false),
      });
      setVisible(true);
    }
  }, [lastRawMessage]);

  if (!visible || !alertProps) return null;
  return <GlobalAlert {...alertProps} />;
};

export default NotificationManager;
