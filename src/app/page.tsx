import Sidebar from '@/components/layout/Sidebar';
import Workspace from '@/components/workspace/Workspace';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Search Sidebar - Stacks on top for mobile, 320px fixed width on desktop */}
<aside className="w-full md:w-64 h-[40vh] md:h-screen border-b md:border-b-0 md:border-r border-neutral-800 bg-neutral-900 flex flex-col">
  <Sidebar />
</aside>

      {/* Main Workspace - Takes remaining space */}
      <main className="flex-1 h-[60vh] md:h-screen flex flex-col overflow-y-auto p-4 md:p-8">
        <Workspace />
      </main>
    </div>
  );
}