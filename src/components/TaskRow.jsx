import React from 'react';
import { CalendarDays, Check, Pencil, Trash2 } from 'lucide-react';

export default function TaskRow({ task, today, onToggle, onEdit, onDelete }) {
  const overdue = task.due && task.due < today && !task.done;
  const dueLabel = !task.due ? 'No date' : task.due === today ? 'Today' : new Date(`${task.due}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return (
    <div className={`task-row ${task.done ? 'is-done' : ''}`} data-task-id={task.id}>
      <div className="task-info">
        <button className="task-check" role="checkbox" aria-checked={task.done} aria-label={`Mark ${task.title} ${task.done ? 'incomplete' : 'complete'}`} onClick={() => onToggle(task.id)}>{task.done && <Check size={13} strokeWidth={3} />}</button>
        <button className="task-title" onClick={() => onEdit(task)} title="Edit task"><span>{task.title}</span>{task.notes && <small>{task.notes}</small>}</button>
      </div>
      <div className="task-project"><span className={`project-dot ${task.project.toLowerCase()}`} />{task.project}</div>
      <div><span className={`priority ${task.priority.toLowerCase()}`}><i />{task.priority}</span></div>
      <div className={`task-date ${overdue ? 'overdue' : ''}`}><CalendarDays size={13} />{dueLabel}</div>
      <div className="row-actions"><button className="icon-button" aria-label={`Edit ${task.title}`} onClick={() => onEdit(task)}><Pencil size={14} /></button><button className="icon-button delete-button" aria-label={`Delete ${task.title}`} onClick={() => onDelete(task.id)}><Trash2 size={14} /></button></div>
    </div>
  );
}
