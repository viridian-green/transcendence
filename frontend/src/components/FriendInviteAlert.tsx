import React from 'react';
import PinkButton from './PinkButton';

interface FriendInviteAlertProps {
  message: string;
  visible: boolean;
  userId: string;
  onClose: () => void;
}

const FriendInviteAlert: React.FC<FriendInviteAlertProps> = ({ message, visible, userId, onClose }) => {
  const [loading, setLoading] = React.useState(false);
  const [localMsg, setLocalMsg] = React.useState<string | null>(null);
  if (!visible) return null;

  const handleAccept = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/friends/${userId}/accept`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to accept friend invite');
      setLocalMsg('Friend invite accepted!');
    } catch (err) {
      setLocalMsg(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/friends/${userId}/reject`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to reject friend invite');
      setLocalMsg('Friend invite rejected.');
    } catch (err) {
      setLocalMsg(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-lg bg-surface p-6 shadow-lg min-w-[320px] max-w-[90vw]">
        <p className="mb-4 text-lg font-semibold text-center">
          {localMsg ? localMsg : message}
        </p>
        <div className="flex justify-end gap-2">
          {!localMsg ? (
            <>
              <PinkButton
                text="Cancel"
                className="px-3 py-1"
                onClick={handleReject}
                disabled={loading}
              />
              <PinkButton
                text="Accept"
                className="px-3 py-1"
                onClick={handleAccept}
                disabled={loading}
              />
            </>
          ) : (
            <PinkButton
              text="Close"
              className="px-3 py-1"
              onClick={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendInviteAlert;
