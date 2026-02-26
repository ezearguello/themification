'use client';

import type { FigmaVariable } from '@/types/figma';
import {
  isVariableAlias,
  isRGBAColor,
  resolveAliasName,
  rgbaToHex,
  getTokenType,
} from '@/lib/variable-resolver';
import ColorSwatch from './ColorSwatch';
import TypeBadge from './TypeBadge';

interface VariableTableProps {
  groupPath: string;
  variables: FigmaVariable[];
  modes: Array<{ modeId: string; name: string }>;
  activeModeId: string | null;
  variableMap: Map<string, FigmaVariable>;
}

export default function VariableTable({
  groupPath,
  variables,
  modes,
  activeModeId,
  variableMap,
}: VariableTableProps) {
  // Determine which modes to show
  const displayModes =
    activeModeId ? modes.filter((m) => m.modeId === activeModeId) : modes;

  const hasMultipleModes = modes.length > 1;

  // Use the first variable to determine type (they should all be consistent)
  const resolvedType = variables[0]?.resolvedType ?? 'STRING';

  const displayLabel = groupPath
    ? groupPath.split('/').pop() ?? groupPath
    : 'Variables';

  return (
    <div id={`group-${groupPath}`} className="mb-8">
      <h3 className="text-sm font-semibold text-gray-700 mb-2 capitalize">
        {displayLabel}
        <span className="ml-2 text-xs font-normal text-gray-400">
          ({variables.length})
        </span>
      </h3>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-64">
                Token Name
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Description
              </th>
              {resolvedType === 'COLOR' && (
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">
                  Type
                </th>
              )}
              {hasMultipleModes
                ? displayModes.map((mode) => (
                    <th
                      key={mode.modeId}
                      className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {mode.name}
                    </th>
                  ))
                : (
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {variables.map((variable) => {
              const tokenType = getTokenType(
                variable,
                displayModes[0]?.modeId ?? modes[0]?.modeId ?? '',
              );

              return (
                <tr key={variable.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-800 break-all">
                    {variable.name}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-500 max-w-xs">
                    {variable.description || (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  {resolvedType === 'COLOR' && (
                    <td className="px-4 py-2.5">
                      <TypeBadge type={tokenType} />
                    </td>
                  )}
                  {(hasMultipleModes ? displayModes : modes.slice(0, 1)).map(
                    (mode) => {
                      const value =
                        variable.valuesByMode[mode.modeId] ??
                        Object.values(variable.valuesByMode)[0];

                      return (
                        <td key={mode.modeId} className="px-4 py-2.5">
                          <ValueCell
                            value={value}
                            resolvedType={resolvedType}
                            variable={variable}
                            modeId={mode.modeId}
                            variableMap={variableMap}
                          />
                        </td>
                      );
                    },
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ValueCellProps {
  value: import('@/types/figma').VariableValue | undefined;
  resolvedType: string;
  variable: FigmaVariable;
  modeId: string;
  variableMap: Map<string, FigmaVariable>;
}

function ValueCell({ value, resolvedType, variable, modeId, variableMap }: ValueCellProps) {
  if (value === undefined || value === null) {
    return <span className="text-gray-300">—</span>;
  }

  if (isVariableAlias(value)) {
    const aliasName = resolveAliasName(value, variableMap);
    return (
      <div className="flex items-center gap-2">
        {resolvedType === 'COLOR' && (
          <ColorSwatch variable={variable} modeId={modeId} variableMap={variableMap} />
        )}
        <span className="font-mono text-xs text-indigo-600 truncate max-w-xs" title={aliasName}>
          {aliasName}
        </span>
      </div>
    );
  }

  if (resolvedType === 'COLOR' && isRGBAColor(value)) {
    const hex = rgbaToHex(value);
    return (
      <div className="flex items-center gap-2">
        <ColorSwatch variable={variable} modeId={modeId} variableMap={variableMap} />
        <span className="font-mono text-xs text-gray-700">{hex.toUpperCase()}</span>
      </div>
    );
  }

  if (resolvedType === 'FLOAT' && typeof value === 'number') {
    return (
      <span className="font-mono text-xs text-gray-700">
        {Number.isInteger(value) ? value : value.toFixed(2)}
      </span>
    );
  }

  if (typeof value === 'string') {
    return <span className="text-xs text-gray-700 font-mono">{value}</span>;
  }

  if (typeof value === 'boolean') {
    return (
      <span className="text-xs text-gray-700">{value ? 'true' : 'false'}</span>
    );
  }

  return <span className="text-xs text-gray-500">{JSON.stringify(value)}</span>;
}
