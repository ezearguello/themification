import type {
  FigmaVariable,
  FigmaVariableCollection,
  ParsedCollection,
  ParsedGroup,
  LibraryData,
} from '@/types/figma';

/**
 * Extract the top-level group from a variable name.
 * E.g. "color/surface/page" → top group "color", sub "surface"
 * E.g. "surface/page" → top group "surface"
 */
export function getVariableGroupPath(name: string): string[] {
  const parts = name.split('/');
  // Remove the last part (the token name itself)
  return parts.slice(0, -1);
}

export function getTopLevelGroup(name: string): string {
  return name.split('/')[0];
}

/**
 * Parse a library's variables into grouped collections for the sidebar and tables.
 */
export function parseLibraryCollections(
  library: LibraryData,
): ParsedCollection[] {
  const { variables, collections } = library;

  return Object.values(collections).map((collection) => {
    // Get all variables belonging to this collection
    const collectionVars = collection.variableIds
      .map((id) => variables[id])
      .filter(Boolean);

    // Group variables by their path (all segments except the last token name)
    const variablesByGroup: Record<string, FigmaVariable[]> = {};

    for (const variable of collectionVars) {
      const parts = variable.name.split('/');
      // Groups are formed by all segments except the last
      if (parts.length === 1) {
        // No group prefix — use empty string as root group
        const key = '';
        variablesByGroup[key] = variablesByGroup[key] ?? [];
        variablesByGroup[key].push(variable);
      } else {
        // Use everything except last segment as group key
        const groupKey = parts.slice(0, -1).join('/');
        variablesByGroup[groupKey] = variablesByGroup[groupKey] ?? [];
        variablesByGroup[groupKey].push(variable);
      }
    }

    // Build hierarchical group tree for sidebar
    const groups = buildGroupTree(variablesByGroup);

    return {
      collectionId: collection.id,
      collectionName: collection.name,
      modes: collection.modes,
      groups,
      variablesByGroup,
      totalCount: collectionVars.length,
    };
  });
}

function buildGroupTree(
  variablesByGroup: Record<string, FigmaVariable[]>,
): ParsedGroup[] {
  const allPaths = Object.keys(variablesByGroup);

  // Build a set of all unique segment paths
  const pathSet = new Set<string>();
  for (const path of allPaths) {
    if (!path) continue;
    const parts = path.split('/');
    for (let i = 1; i <= parts.length; i++) {
      pathSet.add(parts.slice(0, i).join('/'));
    }
  }

  // Get top-level paths
  const topLevel = [...pathSet].filter((p) => !p.includes('/'));

  function buildNode(path: string): ParsedGroup {
    const label = path.split('/').pop() ?? path;
    const directCount = variablesByGroup[path]?.length ?? 0;
    const childPaths = [...pathSet].filter(
      (p) => p !== path && p.startsWith(path + '/') && !p.slice(path.length + 1).includes('/'),
    );
    const children = childPaths.map(buildNode);
    const descendantCount = children.reduce((sum, c) => sum + c.count, 0);

    return {
      path,
      label,
      count: directCount + descendantCount,
      children,
    };
  }

  // Also handle root-level variables (no group)
  const nodes: ParsedGroup[] = topLevel.map(buildNode);

  return nodes;
}

export function exportToCSV(
  collection: ParsedCollection,
  variables: Record<string, FigmaVariable>,
  modeId: string,
): string {
  const rows: string[][] = [['Token Name', 'Type', 'Description', 'Value']];

  for (const [groupPath, vars] of Object.entries(collection.variablesByGroup)) {
    for (const v of vars) {
      const value = v.valuesByMode[modeId];
      let valueStr = '';
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && 'type' in value) {
          valueStr = `alias:${(value as { id: string }).id}`;
        } else {
          valueStr = JSON.stringify(value);
        }
      }
      rows.push([v.name, v.resolvedType, v.description, valueStr]);
    }
  }

  return rows
    .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

export function exportToJSON(
  library: LibraryData,
  modeId: string,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [, variable] of Object.entries(library.variables)) {
    result[variable.name] = {
      type: variable.resolvedType,
      description: variable.description,
      value: variable.valuesByMode[modeId],
    };
  }
  return result;
}
