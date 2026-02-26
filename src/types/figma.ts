// Figma REST API types

export interface FigmaProject {
  id: string;
  name: string;
}

export interface FigmaFile {
  key: string;
  name: string;
  thumbnail_url?: string;
  last_modified?: string;
}

export interface FigmaTeamProjectsResponse {
  projects: FigmaProject[];
}

export interface FigmaProjectFilesResponse {
  files: FigmaFile[];
  name: string;
}

// Variable types from the Figma Variables API
export type VariableResolvedDataType = 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN';

export interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface VariableAlias {
  type: 'VARIABLE_ALIAS';
  id: string;
}

export type VariableValue = RGBAColor | number | string | boolean | VariableAlias;

export interface FigmaVariable {
  id: string;
  name: string;
  key: string;
  variableCollectionId: string;
  resolvedType: VariableResolvedDataType;
  description: string;
  hiddenFromPublishing: boolean;
  scopes: string[];
  codeSyntax: Record<string, string>;
  valuesByMode: Record<string, VariableValue>;
}

export interface FigmaVariableCollection {
  id: string;
  name: string;
  key: string;
  modes: Array<{ modeId: string; name: string }>;
  defaultModeId: string;
  remote: boolean;
  hiddenFromPublishing: boolean;
  variableIds: string[];
}

export interface FigmaVariablesLocalResponse {
  status: number;
  error: boolean;
  meta: {
    variables: Record<string, FigmaVariable>;
    variableCollections: Record<string, FigmaVariableCollection>;
  };
}

// App-specific types
export interface LibraryData {
  fileKey: string;
  fileName: string;
  variables: Record<string, FigmaVariable>;
  collections: Record<string, FigmaVariableCollection>;
}

export interface GroupedVariables {
  collectionId: string;
  collectionName: string;
  modes: Array<{ modeId: string; name: string }>;
  groups: Record<string, FigmaVariable[]>;
}

export interface ParsedGroup {
  path: string;
  label: string;
  count: number;
  children: ParsedGroup[];
}

export interface ParsedCollection {
  collectionId: string;
  collectionName: string;
  modes: Array<{ modeId: string; name: string }>;
  groups: ParsedGroup[];
  variablesByGroup: Record<string, FigmaVariable[]>;
  totalCount: number;
}

export interface SelectedFile {
  key: string;
  name: string;
  projectName: string;
}
