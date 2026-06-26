import { SessionScope } from '../../lib/sessionManager';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface SessionTimeoutWarningProps {
  scope: SessionScope;
  open: boolean;
  remainingMs: number;
  onExtend: () => void;
  onSignOut: () => void;
}

function formatRemaining(ms: number): string {
  const minutes = Math.max(1, Math.ceil(ms / 60_000));
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
}

export default function SessionTimeoutWarning({
  scope,
  open,
  remainingMs,
  onExtend,
  onSignOut,
}: SessionTimeoutWarningProps) {
  const label = scope === 'admin' ? 'staff session' : 'session';

  return (
    <Modal isOpen={open} onClose={onExtend} size="sm">
      <div className="p-6 text-center">
        <h2 className="text-lg font-semibold text-ink mb-2">Session expiring soon</h2>
        <p className="text-sm text-ink-secondary mb-6">
          Your {label} will end in about {formatRemaining(remainingMs)} due to inactivity.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onExtend}>Stay signed in</Button>
          <Button variant="outline" onClick={onSignOut}>Sign out now</Button>
        </div>
      </div>
    </Modal>
  );
}
