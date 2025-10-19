import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="loading-state">
      <div className="loading-spinner">
        <Loader2 size={48} className="spinner-icon" />
      </div>
      <p className="loading-text">{message}</p>
    </div>
  );
}

