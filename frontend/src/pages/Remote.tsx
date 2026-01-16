import { useEffect, useState } from 'react';
import { PinkButton } from '@/components';
import { useChatSocket } from '@/hooks/useChatSocket';

type Friend = {
  id: string;
  username: string;
  status: 'online' | 'offline' | 'ingame';
};

const MOCK_FRIENDS: Friend[] = [
  { id: 'u1', username: 'alice', status: 'online' },
  { id: 'u2', username: 'bob', status: 'ingame' },
  { id: 'u3', username: 'charlie', status: 'offline' },
];

type InvitePopupState = {
  fromUserId: string;
  fromUsername: string;
  gameMode: string;
} | null;

const Remote = () => {
  const [friends] = useState<Friend[]>(MOCK_FRIENDS);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [incomingInvite, setIncomingInvite] = useState<InvitePopupState>(null);

  const { send, lastRawMessage, isConnected } = useChatSocket(true);

  useEffect(() => {
    if (!lastRawMessage) return;

    console.log('[REMOTE] raw WS message', lastRawMessage);

    if (lastRawMessage.type === 'INVITE_RECEIVED') {
      setIncomingInvite({
        fromUserId: lastRawMessage.fromUserId,
        fromUsername: lastRawMessage.fromUsername,
        gameMode: lastRawMessage.gameMode || 'pong',
      });
    }
  }, [lastRawMessage]);

  const handleChallenge = (friend: Friend) => {
    if (friend.status !== 'online') return;
    if (!isConnected) {
      console.warn('[REMOTE] cannot send INVITE, socket not connected');
      return;
    }

    send({
      type: 'INVITE',
      toUserId: friend.id,
      gameMode: 'pong',
    });
  };

  const handleInviteAccept = () => {
    if (!incomingInvite || !isConnected) {
      setIncomingInvite(null);
      return;
    }

    send({
      type: 'INVITE_ACCEPT',
      fromUserId: incomingInvite.fromUserId,
    });

    setIncomingInvite(null);
  };

  const handleInviteDecline = () => {
    setIncomingInvite(null);
  };

  return (
    <div className='bg-bg flex min-h-screen flex-col items-center justify-center gap-6'>
      <h1 className='text-accent-pink font-retro text-4xl font-bold'>Remote</h1>

      <div className='w-full max-w-xl space-y-4'>
        {friends.map((friend) => (
          <div
            key={friend.id}
            className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 ${
              selectedFriend?.id === friend.id
                ? 'border-accent-pink bg-surface'
                : 'border-border bg-bg'
            }`}
          >
            <button
              type='button'
              onClick={() => setSelectedFriend(friend)}
              className='flex flex-1 items-center justify-between text-left'
            >
              <div>
                <p className='text-lg font-semibold'>{friend.username}</p>
                <p className='text-sm text-text-secondary'>
                  {friend.status === 'online' && 'Online'}
                  {friend.status === 'ingame' && 'Playing'}
                  {friend.status === 'offline' && 'Offline'}
                </p>
              </div>
              <span
                className={`ml-4 h-3 w-3 rounded-full ${
                  friend.status === 'online'
                    ? 'bg-green-500'
                    : friend.status === 'ingame'
                    ? 'bg-yellow-500'
                    : 'bg-gray-500'
                }`}
              />
            </button>

            <PinkButton
              text='Challenge'
              className='ml-4 text-accent-pink disabled:opacity-50'
              onClick={() => handleChallenge(friend)}
              disabled={friend.status !== 'online' || !isConnected}
            />
          </div>
        ))}
      </div>

      {incomingInvite && (
        <div className='fixed inset-0 flex items-center justify-center bg-black/50'>
          <div className='rounded-lg bg-surface p-6 shadow-lg'>
            <p className='mb-4 text-lg font-semibold'>
              {incomingInvite.fromUsername} invites you to play {incomingInvite.gameMode}.
            </p>
            <div className='flex justify-end gap-2'>
              <button
                type='button'
                className='rounded border px-3 py-1'
                onClick={handleInviteDecline}
              >
                Cancel
              </button>
              <PinkButton
                text='Accept'
                className='px-3 py-1'
                onClick={handleInviteAccept}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Remote;