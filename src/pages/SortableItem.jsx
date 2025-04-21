import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableItem({ id, title, description, dueDate, priority }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="task-card"
      {...attributes}
      {...listeners}
    >
      <h5>{title}</h5>
      <p>{description}</p>
      <p>📅 {dueDate}</p>
      <p>🔥 {priority}</p>
      <button>Edit</button>
    </div>
  );
}