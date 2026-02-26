'use client';

import { useState } from 'react';
import type { ParsedCollection, ParsedGroup } from '@/types/figma';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface GroupSidebarProps {
  collections: ParsedCollection[];
  onGroupClick: (collectionId: string, groupPath: string) => void;
  activeGroup: string | null;
}

export default function GroupSidebar({
  collections,
  onGroupClick,
  activeGroup,
}: GroupSidebarProps) {
  return (
    <nav className="w-64 flex-shrink-0 overflow-y-auto">
      {collections.map((collection) => (
        <CollectionTree
          key={collection.collectionId}
          collection={collection}
          onGroupClick={onGroupClick}
          activeGroup={activeGroup}
        />
      ))}
    </nav>
  );
}

function CollectionTree({
  collection,
  onGroupClick,
  activeGroup,
}: {
  collection: ParsedCollection;
  onGroupClick: (collectionId: string, groupPath: string) => void;
  activeGroup: string | null;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 w-full text-left px-3 py-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:bg-gray-100 rounded-md"
      >
        {open ? (
          <ChevronDown className="w-3 h-3 text-gray-400" />
        ) : (
          <ChevronRight className="w-3 h-3 text-gray-400" />
        )}
        <span className="flex-1 truncate">{collection.collectionName}</span>
        <span className="text-gray-400 font-normal normal-case tracking-normal">
          {collection.totalCount}
        </span>
      </button>

      {open && (
        <div className="ml-2">
          {collection.groups.map((group) => (
            <GroupNode
              key={group.path}
              group={group}
              collectionId={collection.collectionId}
              onGroupClick={onGroupClick}
              activeGroup={activeGroup}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GroupNode({
  group,
  collectionId,
  onGroupClick,
  activeGroup,
  depth,
}: {
  group: ParsedGroup;
  collectionId: string;
  onGroupClick: (collectionId: string, groupPath: string) => void;
  activeGroup: string | null;
  depth: number;
}) {
  const [open, setOpen] = useState(depth === 0);
  const hasChildren = group.children.length > 0;
  const isActive = activeGroup === `${collectionId}::${group.path}`;

  return (
    <div>
      <button
        onClick={() => {
          onGroupClick(collectionId, group.path);
          if (hasChildren) setOpen((o) => !o);
        }}
        className={`flex items-center gap-1 w-full text-left px-3 py-1 text-xs rounded-md transition-colors ${
          isActive
            ? 'bg-indigo-50 text-indigo-700 font-medium'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        style={{ paddingLeft: `${(depth + 1) * 12 + 12}px` }}
      >
        {hasChildren ? (
          <span className="flex-shrink-0">
            {open ? (
              <ChevronDown className="w-3 h-3 text-gray-400" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-400" />
            )}
          </span>
        ) : (
          <span className="w-3 flex-shrink-0" />
        )}
        <span className="flex-1 truncate capitalize">{group.label}</span>
        <span className="text-gray-400 ml-1">{group.count}</span>
      </button>

      {open && hasChildren && (
        <div>
          {group.children.map((child) => (
            <GroupNode
              key={child.path}
              group={child}
              collectionId={collectionId}
              onGroupClick={onGroupClick}
              activeGroup={activeGroup}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
