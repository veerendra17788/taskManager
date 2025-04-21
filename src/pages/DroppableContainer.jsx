import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export function DroppableContainer({ id, title, children }) {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div ref={setNodeRef} className="kanban-column">
      <h4>{title}</h4>
      {children}
    </div>
  );
}