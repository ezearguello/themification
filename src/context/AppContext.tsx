'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { LibraryData, SelectedFile } from '@/types/figma';

interface AppState {
  token: string;
  teamId: string;
  selectedFiles: SelectedFile[];
  libraries: LibraryData[];
  isLoading: boolean;
  error: string | null;
}

interface AppContextValue extends AppState {
  setToken: (token: string) => void;
  setTeamId: (teamId: string) => void;
  setSelectedFiles: (files: SelectedFile[]) => void;
  setLibraries: (libraries: LibraryData[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const defaultState: AppState = {
  token: '',
  teamId: '',
  selectedFiles: [],
  libraries: [],
  isLoading: false,
  error: null,
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    // Restore token/teamId from localStorage if available
    if (typeof window !== 'undefined') {
      return {
        ...defaultState,
        token:
          localStorage.getItem('figma_token') ??
          process.env.NEXT_PUBLIC_FIGMA_TOKEN ??
          '',
        teamId:
          localStorage.getItem('figma_team_id') ??
          process.env.NEXT_PUBLIC_FIGMA_TEAM_ID ??
          '',
      };
    }
    return defaultState;
  });

  const setToken = useCallback((token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('figma_token', token);
    }
    setState((s) => ({ ...s, token }));
  }, []);

  const setTeamId = useCallback((teamId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('figma_team_id', teamId);
    }
    setState((s) => ({ ...s, teamId }));
  }, []);

  const setSelectedFiles = useCallback((selectedFiles: SelectedFile[]) => {
    setState((s) => ({ ...s, selectedFiles }));
  }, []);

  const setLibraries = useCallback((libraries: LibraryData[]) => {
    setState((s) => ({ ...s, libraries }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState((s) => ({ ...s, isLoading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((s) => ({ ...s, error }));
  }, []);

  const reset = useCallback(() => {
    setState((s) => ({ ...s, libraries: [], selectedFiles: [], error: null }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        setToken,
        setTeamId,
        setSelectedFiles,
        setLibraries,
        setLoading,
        setError,
        reset,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
