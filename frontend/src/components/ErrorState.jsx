import { AlertCircle } from 'lucide-react';

export default function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <span className="mb-5 grid h-14 w-14 place-items-center rounded-full bg-danger-soft text-danger">
        <AlertCircle size={24} />
      </span>
      <h2 className="text-xl font-semibold tracking-tight">Something went wrong</h2>
      <p className="mt-2 font-serif text-lg leading-snug text-mute">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary mt-6">
          Try again
        </button>
      )}
    </div>
  );
}
