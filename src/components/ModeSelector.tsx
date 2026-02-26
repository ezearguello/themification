'use client';

interface Mode {
  modeId: string;
  name: string;
}

interface ModeSelectorProps {
  modes: Mode[];
  activeModeId: string | null;
  onChange: (modeId: string | null) => void;
}

export default function ModeSelector({
  modes,
  activeModeId,
  onChange,
}: ModeSelectorProps) {
  if (modes.length <= 1) return null;

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1 text-xs rounded-md transition-colors ${
          activeModeId === null
            ? 'bg-white shadow-sm text-gray-800 font-medium'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        All modes
      </button>
      {modes.map((mode) => (
        <button
          key={mode.modeId}
          onClick={() => onChange(mode.modeId)}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            activeModeId === mode.modeId
              ? 'bg-white shadow-sm text-gray-800 font-medium'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {mode.name}
        </button>
      ))}
    </div>
  );
}
