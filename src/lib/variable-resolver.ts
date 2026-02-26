import type {
  FigmaVariable,
  VariableValue,
  VariableAlias,
  RGBAColor,
  LibraryData,
} from '@/types/figma';

export function isVariableAlias(value: VariableValue): value is VariableAlias {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    (value as VariableAlias).type === 'VARIABLE_ALIAS'
  );
}

export function isRGBAColor(value: VariableValue): value is RGBAColor {
  return (
    typeof value === 'object' &&
    value !== null &&
    'r' in value &&
    'g' in value &&
    'b' in value &&
    'a' in value
  );
}

export function rgbaToHex(rgba: RGBAColor): string {
  const toHex = (n: number) =>
    Math.round(n * 255)
      .toString(16)
      .padStart(2, '0');
  const hex = `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}`;
  if (rgba.a < 1) {
    return `${hex}${toHex(rgba.a)}`;
  }
  return hex;
}

export function rgbaToCss(rgba: RGBAColor): string {
  const r = Math.round(rgba.r * 255);
  const g = Math.round(rgba.g * 255);
  const b = Math.round(rgba.b * 255);
  if (rgba.a < 1) {
    return `rgba(${r}, ${g}, ${b}, ${rgba.a.toFixed(2)})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
}

/** Build a unified variable map from all loaded libraries */
export function buildVariableMap(
  libraries: LibraryData[],
): Map<string, FigmaVariable> {
  const map = new Map<string, FigmaVariable>();
  for (const lib of libraries) {
    for (const [id, variable] of Object.entries(lib.variables)) {
      map.set(id, variable);
    }
  }
  return map;
}

/** Resolve an alias chain to get the referenced variable name */
export function resolveAliasName(
  alias: VariableAlias,
  variableMap: Map<string, FigmaVariable>,
  depth = 0,
): string {
  if (depth > 10) return alias.id; // prevent infinite loops
  const referenced = variableMap.get(alias.id);
  if (!referenced) return alias.id;
  return referenced.name;
}

/** Recursively resolve the final RGBA color of an alias chain */
export function resolveColorValue(
  value: VariableValue,
  modeId: string,
  variableMap: Map<string, FigmaVariable>,
  depth = 0,
): RGBAColor | null {
  if (depth > 10) return null;

  if (isRGBAColor(value)) return value;

  if (isVariableAlias(value)) {
    const referenced = variableMap.get(value.id);
    if (!referenced) return null;
    // Use the default mode of the referenced variable's collection for cross-file refs
    const nextValue =
      referenced.valuesByMode[modeId] ??
      Object.values(referenced.valuesByMode)[0];
    if (!nextValue) return null;
    return resolveColorValue(nextValue, modeId, variableMap, depth + 1);
  }

  return null;
}

/** Determine if a token is "Brand dependent" (alias) or "Static" (hardcoded) */
export function getTokenType(
  variable: FigmaVariable,
  modeId: string,
): 'brand-dependent' | 'static' {
  const value = variable.valuesByMode[modeId];
  if (!value) return 'static';
  return isVariableAlias(value) ? 'brand-dependent' : 'static';
}
