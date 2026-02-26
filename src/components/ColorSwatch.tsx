'use client';

import { rgbaToCss, resolveColorValue, rgbaToHex } from '@/lib/variable-resolver';
import type { FigmaVariable } from '@/types/figma';

interface ColorSwatchProps {
  variable: FigmaVariable;
  modeId: string;
  variableMap: Map<string, FigmaVariable>;
  size?: number;
}

export default function ColorSwatch({
  variable,
  modeId,
  variableMap,
  size = 20,
}: ColorSwatchProps) {
  const value =
    variable.valuesByMode[modeId] ?? Object.values(variable.valuesByMode)[0];
  if (!value) return null;

  const resolved = resolveColorValue(value, modeId, variableMap);

  if (!resolved) {
    // Show a placeholder for unresolvable colors
    return (
      <span
        className="inline-block border border-gray-200 rounded"
        style={{
          width: size,
          height: size,
          background:
            'repeating-linear-gradient(45deg, #ccc 0, #ccc 2px, #fff 2px, #fff 8px)',
        }}
        title="Color could not be resolved"
      />
    );
  }

  const cssColor = rgbaToCss(resolved);
  const hexColor = rgbaToHex(resolved);

  // Determine if we need a border (for very light / transparent colors)
  const needsBorder = resolved.a < 0.1 || (resolved.r > 0.9 && resolved.g > 0.9 && resolved.b > 0.9);

  return (
    <span
      className="inline-block rounded-sm flex-shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: cssColor,
        border: needsBorder ? '1px solid #e5e7eb' : '1px solid transparent',
      }}
      title={hexColor}
    />
  );
}
