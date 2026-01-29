
import PinkButton from './PinkButton';

interface GlobalAlertProps {
  message: string;
  type: string;
  visible: boolean;
  onClose: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
}

const GlobalAlert = ({ message, type, visible, onClose, onAccept, onDecline }: GlobalAlertProps) => {
  if (!visible) return null;
  let bgColor = 'var(--color-surface)';
  let textColor = 'var(--color-text-primary)';
  if (type === 'received') {
    bgColor = 'var(--color-status-online)';
    textColor = 'var(--color-text-inverse)';
  } else if (type === 'sent') {
    bgColor = 'var(--color-accent-pink)';
    textColor = 'var(--color-text-inverse)';
  }

  return (
    <div
      className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded px-6 py-3 shadow-lg flex flex-col items-center"
      style={{ background: bgColor, color: textColor }}
    >
      <div>{message}</div>
      {type === 'received' ? (
        <div className="mt-4 flex gap-4">
          <PinkButton text="Accept" onClick={onAccept} />
          <PinkButton text="Decline" onClick={onDecline} className="border-gray-400 hover:bg-gray-400" />
        </div>
      ) : (
        <button onClick={onClose} className="ml-4 mt-4 px-4 py-2 rounded bg-[var(--color-border)] hover:bg-[var(--color-surface)]">Close</button>
      )}
    </div>
  );
};

export default GlobalAlert;