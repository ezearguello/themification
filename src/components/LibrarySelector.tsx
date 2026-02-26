'use client';

import { useState, useCallback } from 'react';
import { getAllTeamFiles } from '@/lib/figma-api';
import type { SelectedFile } from '@/types/figma';

interface ProjectGroup {
  projectId: string;
  projectName: string;
  files: Array<{ key: string; name: string }>;
}

interface LibrarySelectorProps {
  token: string;
  teamId: string;
  onFilesSelected: (files: SelectedFile[]) => void;
}

export default function LibrarySelector({
  token,
  teamId,
  onFilesSelected,
}: LibrarySelectorProps) {
  const [projects, setProjects] = useState<ProjectGroup[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!token || !teamId) {
      setError('Please enter both a Figma token and team ID.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getAllTeamFiles(teamId, token);
      setProjects(data);
      setFetched(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch projects.');
    } finally {
      setLoading(false);
    }
  }, [token, teamId]);

  const toggleFile = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleLoadVariables = () => {
    const files: SelectedFile[] = [];
    for (const project of projects) {
      for (const file of project.files) {
        if (selected.has(file.key)) {
          files.push({
            key: file.key,
            name: file.name,
            projectName: project.projectName,
          });
        }
      }
    }
    onFilesSelected(files);
  };

  if (!fetched) {
    return (
      <button
        onClick={fetchProjects}
        disabled={loading}
        className="w-full py-2.5 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Connecting...' : 'Connect & fetch projects'}
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
        {projects.map((project) => (
          <div key={project.projectId}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              {project.projectName}
            </p>
            <div className="space-y-1">
              {project.files.length === 0 ? (
                <p className="text-xs text-gray-400 pl-2">No files</p>
              ) : (
                project.files.map((file) => (
                  <label
                    key={file.key}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(file.key)}
                      onChange={() => toggleFile(file.key)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="ml-auto text-xs text-gray-400 font-mono">
                      {file.key.slice(0, 8)}…
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={() => setFetched(false)}
          className="py-2 px-4 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Re-fetch
        </button>
        <button
          onClick={handleLoadVariables}
          disabled={selected.size === 0}
          className="flex-1 py-2 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Load variables ({selected.size} selected)
        </button>
      </div>
    </div>
  );
}
