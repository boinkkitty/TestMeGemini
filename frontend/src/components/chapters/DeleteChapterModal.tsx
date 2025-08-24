// Modal component for confirmation
function DeleteChapterModal({ open, onClose, onConfirm, chapterTitle, deleteAttempts, setDeleteAttempts }: {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    chapterTitle: string;
    deleteAttempts: boolean;
    setDeleteAttempts: (v: boolean) => void;
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-lg font-bold mb-4">Delete Chapter</h2>
                <p className="mb-4">Are you sure you want to delete <span className="font-semibold">{chapterTitle}</span>?</p>
                <div className="flex items-center mb-4">
                    <input
                        id="delete-attempts"
                        type="checkbox"
                        checked={deleteAttempts}
                        onChange={e => setDeleteAttempts(e.target.checked)}
                        className="mr-2"
                    />
                    <label htmlFor="delete-attempts" className="text-sm">Delete related attempts</label>
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-semibold">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-semibold">Delete</button>
                </div>
            </div>
        </div>
    );
}

export default DeleteChapterModal;