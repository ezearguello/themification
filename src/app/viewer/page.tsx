'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import GroupSidebar from '@/components/GroupSidebar';
import VariableTable from '@/components/VariableTable';
import ModeSelector from '@/components/ModeSelector';
import { parseLibraryCollections, exportToCSV, exportToJSON } from '@/lib/variable-parser';
import { buildVariableMap } from '@/lib/variable-resolver';
import type { ParsedCollection } from '@/types/figma';
import { Menu, X, Download, ArrowLeft } from 'lucide-react';

export default function ViewerPage() {
  const router = useRouter();
  const { libraries, selectedFiles } = useApp();
  const [activeLibIdx, setActiveLibIdx] = useState(0);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [activeModeId, setActiveModeId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const mainRef = useRef<HTMLDivElement>(null);

  // Redirect to home if no libraries are loaded
  useEffect(() => {
    if (libraries.length === 0) {
      router.replace('/');
    }
  }, [libraries, router]);

  const variableMap = buildVariableMap(libraries);
  const activeLibrary = libraries[activeLibIdx];

  const collections: ParsedCollection[] = activeLibrary
    ? parseLibraryCollections(activeLibrary)
    : [];

  const handleGroupClick = useCallback(
    (collectionId: string, groupPath: string) => {
      const key = `${collectionId}::${groupPath}`;
      setActiveGroup(key);
      // Scroll to the group's table
      const el = document.getElementById(`group-${groupPath}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [],
  );

  // When switching library tabs, reset mode and active group
  const handleLibSwitch = (idx: number) => {
    setActiveLibIdx(idx);
    setActiveGroup(null);
    setActiveModeId(null);
    mainRef.current?.scrollTo({ top: 0 });
  };

  const handleExportCSV = () => {
    if (!activeLibrary || collections.length === 0) return;
    const col = collections[0];
    const modeId = activeModeId ?? col.modes[0]?.modeId ?? '';
    const csv = exportToCSV(col, activeLibrary.variables, modeId);
    downloadFile(
      csv,
      `${activeLibrary.fileName}-variables.csv`,
      'text/csv',
    );
  };

  const handleExportJSON = () => {
    if (!activeLibrary) return;
    const modeId = activeModeId ?? collections[0]?.modes[0]?.modeId ?? '';
    const json = exportToJSON(activeLibrary, modeId);
    downloadFile(
      JSON.stringify(json, null, 2),
      `${activeLibrary.fileName}-variables.json`,
      'application/json',
    );
  };

  if (libraries.length === 0) return null;

  // Get all modes of the active collection to drive the ModeSelector
  // We show a global mode selector based on the first collection of the active library
  const allModes = collections[0]?.modes ?? [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => router.push('/')}
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v4a2 2 0 01-2 2H7a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h4v4H7a2 2 0 01-2-2zm8 0v4h2a2 2 0 002-2v-2h-4zm0-4V5H7v4h6z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-800">Variables Viewer</span>
        </div>

        {/* Library tabs */}
        <div className="flex-1 flex items-center gap-1 overflow-x-auto pl-2">
          {selectedFiles.map((file, idx) => (
            <button
              key={file.key}
              onClick={() => handleLibSwitch(idx)}
              className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeLibIdx === idx
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              {file.name}
            </button>
          ))}
        </div>

        {/* Mode selector */}
        {allModes.length > 1 && (
          <ModeSelector
            modes={allModes}
            activeModeId={activeModeId}
            onChange={setActiveModeId}
          />
        )}

        {/* Export */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleExportCSV}
            title="Export CSV"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
          <button
            onClick={handleExportJSON}
            title="Export JSON"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            JSON
          </button>
        </div>

        {/* Sidebar toggle (mobile) */}
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors lg:hidden"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto transition-all ${
            sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
          }`}
        >
          <div className="p-3 min-w-64">
            <GroupSidebar
              collections={collections}
              onGroupClick={handleGroupClick}
              activeGroup={activeGroup}
            />
          </div>
        </aside>

        {/* Main content */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-6">
          {activeLibrary ? (
            <LibraryView
              library={activeLibrary}
              collections={collections}
              activeModeId={activeModeId}
              variableMap={variableMap}
            />
          ) : (
            <p className="text-gray-400 text-sm">No library selected.</p>
          )}
        </main>
      </div>
    </div>
  );
}

// Renders all collections and their group tables for a library
function LibraryView({
  library,
  collections,
  activeModeId,
  variableMap,
}: {
  library: import('@/types/figma').LibraryData;
  collections: ParsedCollection[];
  activeModeId: string | null;
  variableMap: Map<string, import('@/types/figma').FigmaVariable>;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">{library.fileName}</h2>
      <p className="text-xs text-gray-400 font-mono mb-6">{library.fileKey}</p>

      {collections.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">This file has no local variables.</p>
        </div>
      )}

      {collections.map((collection) => {
        const displayModeId =
          activeModeId ?? collection.modes[0]?.modeId ?? '';

        return (
          <section key={collection.collectionId} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-base font-semibold text-gray-800">
                {collection.collectionName}
              </h3>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {collection.totalCount} tokens
              </span>
              {collection.modes.length > 1 && (
                <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {collection.modes.length} modes
                </span>
              )}
            </div>

            {/* Render a table per group */}
            {Object.entries(collection.variablesByGroup).map(([groupPath, vars]) => (
              <VariableTable
                key={groupPath}
                groupPath={groupPath}
                variables={vars}
                modes={collection.modes}
                activeModeId={activeModeId}
                variableMap={variableMap}
              />
            ))}
          </section>
        );
      })}
    </div>
  );
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
