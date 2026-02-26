interface TypeBadgeProps {
  type: 'brand-dependent' | 'static';
}

export default function TypeBadge({ type }: TypeBadgeProps) {
  if (type === 'brand-dependent') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
        Brand dependent
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 whitespace-nowrap">
      Static
    </span>
  );
}
