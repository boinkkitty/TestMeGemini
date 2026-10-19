type ErrorStateProps = {
    message: string;
    onRetry?: () => void;
};

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
    return (
        <div role="alert" className="flex flex-col items-center gap-3 py-12 text-center border border-destructive/30 rounded-xl bg-destructive/5">
            <p className="text-sm font-semibold text-destructive">{message}</p>
            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="px-4 py-2 rounded-md border border-border bg-card text-sm font-semibold hover:border-foreground/30 transition-colors"
                >
                    Retry
                </button>
            )}
        </div>
    );
}
