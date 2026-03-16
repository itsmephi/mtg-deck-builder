"use client";

import { useRef } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Workspace from "@/components/workspace/Workspace";
import { useDeckImportExport } from "@/hooks/useDeckImportExport";

export default function Dashboard() {
  const {
    exportDeck,
    handleImportFile,
    isImporting,
    pendingImport,
    processImport,
    cancelImport,
  } = useDeckImportExport();

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-200 flex flex-col md:flex-row overflow-hidden font-sans">
      <Sidebar
        onImport={() => fileInputRef.current?.click()}
        onExport={exportDeck}
        isImporting={isImporting}
      />

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleImportFile(e, fileInputRef)}
        className="hidden"
        accept=".txt"
      />

      <main className="flex-1 h-[60vh] md:h-screen flex flex-col overflow-y-auto p-4 md:p-8">
        <Workspace
          pendingImport={pendingImport}
          processImport={processImport}
          cancelImport={cancelImport}
        />
      </main>
    </div>
  );
}
