import React, { useEffect, useRef, useState } from 'react';
import { X, Plus, Pencil } from 'lucide-react';

export default function TaskDialog({ task, onSave, onClose }) {
  const dialog = useRef(null);
  const [error, setError] = useState('');
  useEffect(() => {
    dialog.current.showModal();
    return () => dialog.current?.close();
  }, []);

  function submit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (!values.title.trim()) {
      setError('Give your task a name to get started.');
      return;
    }
    onSave({ ...values, title: values.title.trim(), notes: values.notes.trim() });
  }

  return (
    <dialog ref={dialog} className="task-dialog" onCancel={onClose} onClick={event => { if (event.target === dialog.current) onClose(); }} aria-labelledby="dialog-title">
      <div className="dialog-body">
        <header className="dialog-header">
          <span className="dialog-icon">{task ? <Pencil size={21} /> : <Plus size={24} />}</span>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={20} /></button>
        </header>
        <h2 id="dialog-title">{task ? 'A little adjustment' : 'Make room for what’s next'}</h2>
        <p className="dialog-subtitle">{task ? 'Update the details and keep moving forward.' : 'Big ideas start with one small task.'}</p>
        <form onSubmit={submit}>
          <label>Task name<input name="title" placeholder="What would you like to get done?" defaultValue={task?.title ?? ''} maxLength={160} required autoFocus /></label>
          <label>Notes <span className="optional">(optional)</span><textarea name="notes" placeholder="A few details, a helpful reminder…" defaultValue={task?.notes ?? ''} maxLength={2000} rows={3} /></label>
          <div className="form-grid">
            <label>Project<select name="project" defaultValue={task?.project ?? 'Work'}><option>Work</option><option>Personal</option><option>Learning</option></select></label>
            <label>Priority<select name="priority" defaultValue={task?.priority ?? 'Medium'}><option>High</option><option>Medium</option><option>Low</option></select></label>
          </div>
          <label>Due date <span className="optional">(optional)</span><input name="due" type="date" defaultValue={task?.due ?? ''} /></label>
          {error && <p role="alert" className="form-error">{error}</p>}
          <footer className="dialog-footer"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button className="button primary" type="submit">{task ? 'Save changes' : 'Create task'}<Plus size={16} /></button></footer>
        </form>
      </div>
    </dialog>
  );
}
