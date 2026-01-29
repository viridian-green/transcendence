
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-lg bg-surface p-6 shadow-lg min-w-[320px] max-w-[90vw]">
        <p className="mb-4 text-lg font-semibold text-center">
          {message}
        </p>
        <div className="flex justify-end gap-2">
          {type === 'received' ? (
            <>
              <PinkButton
                text="Cancel"
                className="px-3 py-1"
                onClick={onDecline}
              />
              <PinkButton
                text="Accept"
                className="px-3 py-1"
                onClick={onAccept}
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

export default GlobalAlert;