function DeleteChapterModal({ open, onClose, onConfirm, chapterTitle, isDeleteAttempts, setDeleteAttempts }: {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    chapterTitle: string;
    isDeleteAttempts: boolean;
    setDeleteAttempts: (v: boolean) => void;
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-xl shadow-lg p-6 w-full max-w-sm space-y-4">
                <h2 className="text-sm font-bold text-foreground">Delete Chapter</h2>
                <p className="text-sm text-muted-foreground">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-foreground">{chapterTitle}</span>?
                </p>
                <div className="flex items-center gap-2">
                    <input
                        id="delete-attempts"
                        type="checkbox"
                        checked={isDeleteAttempts}
                        onChange={e => setDeleteAttempts(e.target.checked)}
                        className="rounded border-border"
                    />
                    <label htmlFor="delete-attempts" className="text-xs text-muted-foreground">
                        Also delete related attempts
                    </label>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md bg-card border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-md bg-destructive/10 text-destructive text-sm font-semibold hover:bg-destructive/20 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteChapterModal;
