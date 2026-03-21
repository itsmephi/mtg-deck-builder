interface ImportModalProps {
  pendingImport: { filename: string, lines: string[] } | null;
  activeDeckName: string;
  onProcess: (mode: 'current' | 'new') => void;
  onCancel: () => void;
}

export default function ImportModal({ pendingImport, activeDeckName, onProcess, onCancel }: ImportModalProps) {
  if (!pendingImport) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-surface-backdrop backdrop-blur-sm">
      <div className="bg-surface-base border border-line-subtle rounded-xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-bold text-primary mb-2">Import Decklist</h3>
          <p className="text-sm text-tertiary">How would you like to import <strong>{pendingImport.filename}</strong>?</p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onProcess('current')}
            className="px-4 py-3 bg-surface-raised hover:bg-surface-overlay text-primary rounded-lg text-sm font-bold transition-colors text-left"
          >
            Add to Current Deck
            <span className="block text-xs text-muted font-normal mt-1">Merges cards into "{activeDeckName}"</span>
          </button>
          <button 
            onClick={() => onProcess('new')}
            className="px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-lg text-sm font-bold transition-colors text-left"
          >
            Create New Deck
            <span className="block text-xs text-blue-400/70 font-normal mt-1">Generates a new deck using the imported file data</span>
          </button>
        </div>
        <div className="flex justify-end">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-tertiary hover:text-primary text-sm font-bold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}