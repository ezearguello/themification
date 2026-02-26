'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import LibrarySelector from '@/components/LibrarySelector';
import { getLocalVariables } from '@/lib/figma-api';
import type { LibraryData, SelectedFile } from '@/types/figma';

export default function HomePage() {
  const router = useRouter();
  const {
    token,
    teamId,
    setToken,
    setTeamId,
    setLibraries,
    setSelectedFiles,
    setLoading,
    setError,
    isLoading,
    error,
  } = useApp();

  const [pendingFiles, setPendingFiles] = useState<SelectedFile[]>([]);
  const [loadingVars, setLoadingVars] = useState(false);
  const [loadProgress, setLoadProgress] = useState<string>('');

  const handleFilesSelected = (files: SelectedFile[]) => {
    setPendingFiles(files);
  };

  const handleLoadVariables = async () => {
    if (pendingFiles.length === 0) return;
    setLoadingVars(true);
    setLoadProgress('');
    setError(null);

    const libraries: LibraryData[] = [];

    try {
      for (let i = 0; i < pendingFiles.length; i++) {
        const file = pendingFiles[i];
        setLoadProgress(`Loading ${file.name} (${i + 1}/${pendingFiles.length})…`);

        const response = await getLocalVariables(file.key, token);
        if (response.error) {
          throw new Error(`Error fetching variables for "${file.name}"`);
        }

        libraries.push({
          fileKey: file.key,
          fileName: file.name,
          variables: response.meta.variables,
          collections: response.meta.variableCollections,
        });

        // Small delay to respect rate limits when loading multiple files
        if (i < pendingFiles.length - 1) {
          await new Promise((r) => setTimeout(r, 200));
        }
      }

      setLibraries(libraries);
      setSelectedFiles(pendingFiles);
      router.push('/viewer');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load variables.');
    } finally {
      setLoadingVars(false);
      setLoadProgress('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v4a2 2 0 01-2 2H7a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h4v4H7a2 2 0 01-2-2zm8 0v4h2a2 2 0 002-2v-2h-4zm0-4V5H7v4h6z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Figma Variables Viewer
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            Connect to your Figma workspace to inspect design tokens and variables.
          </p>
        </div>

        {/* Connection card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              1. Connect to Figma
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Personal Access Token
                </label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="figd_xxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Stored locally in your browser. Never sent to any server.
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Team ID
                </label>
                <input
                  type="text"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  placeholder="123456789"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Found in your Figma team URL: figma.com/files/team/<strong>TEAM_ID</strong>/…
                </p>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              2. Select libraries
            </h2>
            <LibrarySelector
              token={token}
              teamId={teamId}
              onFilesSelected={handleFilesSelected}
            />
          </div>

          {pendingFiles.length > 0 && (
            <>
              <hr className="border-gray-100" />
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-3">
                  3. Load variables
                </h2>
                <div className="space-y-2 mb-3">
                  {pendingFiles.map((f) => (
                    <div
                      key={f.key}
                      className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                      <span className="flex-1 truncate">{f.name}</span>
                      <span className="text-gray-400">{f.projectName}</span>
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="p-3 mb-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}

                {loadProgress && (
                  <p className="text-xs text-indigo-600 mb-2">{loadProgress}</p>
                )}

                <button
                  onClick={handleLoadVariables}
                  disabled={loadingVars}
                  className="w-full py-2.5 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {loadingVars ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Loading…
                    </>
                  ) : (
                    `Load variables from ${pendingFiles.length} ${pendingFiles.length === 1 ? 'library' : 'libraries'}`
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Variables are fetched directly from the Figma API in your browser.
        </p>
      </div>
    </div>
  );
}
