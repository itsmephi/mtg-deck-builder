interface ImportModalProps {
  pendingImport: { filename: string, lines: string[] } | null;
  activeDeckName: string;
  onProcess: (mode: 'current' | 'new') => void;
  onCancel: () => void;
}

export default function ImportModal({ pendingImport, activeDeckName, onProcess, onCancel }: ImportModalProps) {
  if (!pendingImport) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-2">Import Decklist</h3>
          <p className="text-sm text-neutral-400">How would you like to import <strong>{pendingImport.filename}</strong>?</p>
        </div>
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => onProcess('current')}
            className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-bold transition-colors text-left"
          >
            Add to Current Deck
            <span className="block text-xs text-neutral-500 font-normal mt-1">Merges cards into "{activeDeckName}"</span>
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
            className="px-4 py-2 text-neutral-400 hover:text-white text-sm font-bold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}