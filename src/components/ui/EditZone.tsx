import type { MouseEventHandler, ReactNode } from 'react';
import { useStore, type SectionKey } from '../../store';

interface EditZoneProps {
  target: SectionKey;
  children: ReactNode;
  className?: string;
  /** Optional — when focusing `items`, deep-links to a specific row. */
  itemId?: string;
  as?: 'div' | 'span' | 'section' | 'td' | 'tr';
  title?: string;
}

/** Wraps a preview region so clicking it focuses the matching builder section. */
export function EditZone({
  target,
  children,
  className = '',
  itemId,
  as: Tag = 'div',
  title,
}: EditZoneProps) {
  const focusSection = useStore((s) => s.focusSection);
  const handleClick: MouseEventHandler = (e) => {
    e.stopPropagation();
    focusSection(target, itemId ? { itemId } : undefined);
  };
  return (
    <Tag
      className={`edit-zone ${className}`}
      onClick={handleClick}
      title={title ?? `Click to edit ${target}`}
      data-edit-target={target}
    >
      {children}
    </Tag>
  );
}
