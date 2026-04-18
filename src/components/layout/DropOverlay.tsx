interface DropOverlayProps {
  visible: boolean;
}

export default function DropOverlay({ visible }: DropOverlayProps) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-surface-backdrop/70 pointer-events-none select-none">
      <p className="text-content-heading text-2xl font-semibold mb-2">Drop tab to add card</p>
      <p className="text-content-default text-sm">Release anywhere in the window</p>
    </div>
  );
}
