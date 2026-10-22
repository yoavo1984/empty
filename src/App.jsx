import React, { useEffect, useState } from 'react';
import { Sun, LayoutGrid, CalendarDays, CalendarRange, CircleCheck, Plus, Search, ArrowUpRight, ChevronDown, Check, Flag, Leaf, ListTodo, X, PanelLeftClose, PanelLeftOpen, HardDrive, ArrowUpDown } from 'lucide-react';
import TaskDialog from './components/TaskDialog.jsx';
import TaskRow from './components/TaskRow.jsx';

const STORAGE_KEY = 'daylight.tasks.v1';
const dateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const shiftedDate = days => { const date = new Date(); date.setDate(date.getDate() + days); return dateKey(date); };
const initialTasks = () => [
  { id: 'demo-1', title: 'Map out the week ahead', notes: 'A little planning goes a long way.', project: 'Personal', priority: 'High', due: shiftedDate(0), done: false },
  { id: 'demo-2', title: 'Put the finishing touches on the presentation', notes: '', project: 'Work', priority: 'High', due: shiftedDate(0), done: false },
  { id: 'demo-3', title: 'Read a chapter of that book', notes: '', project: 'Learning', priority: 'Low', due: shiftedDate(1), done: false },
  { id: 'demo-4', title: 'Make time for a walk outside', notes: 'Fresh air, fresh perspective.', project: 'Personal', priority: 'Medium', due: shiftedDate(0), done: false },
  { id: 'demo-5', title: 'Explore ideas for the next project', notes: '', project: 'Work', priority: 'Medium', due: shiftedDate(2), done: false },
  { id: 'demo-6', title: 'Tidy up the workspace', notes: '', project: 'Personal', priority: 'Low', due: shiftedDate(0), done: true },
  { id: 'demo-7', title: 'Finish the introductory lesson', notes: '', project: 'Learning', priority: 'Medium', due: shiftedDate(-1), done: true },
];
function readTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return initialTasks();
    const tasks = JSON.parse(saved);
    if (!Array.isArray(tasks) || !tasks.every(task => typeof task.id === 'string' && typeof task.title === 'string' && typeof task.notes === 'string' && typeof task.due === 'string' && typeof task.done === 'boolean' && ['Work', 'Personal', 'Learning'].includes(task.project) && ['High', 'Medium', 'Low'].includes(task.priority))) throw new Error('Invalid saved tasks');
    return tasks;
  } catch {
    return null;
  }
}

const navigation = [
  { label: 'All tasks', icon: LayoutGrid },
  { label: 'Today', icon: CalendarDays },
  { label: 'Upcoming', icon: CalendarRange },
  { label: 'Completed', icon: CircleCheck },
];

export default function App() {
  const [loaded] = useState(readTasks);
  const [tasks, setTasks] = useState(loaded ?? []);
  const [storageError, setStorageError] = useState(loaded === null ? 'Your saved tasks could not be read. Your existing storage has been left untouched. Check browser storage access, then reload.' : '');
  const [view, setView] = useState('All tasks');
  const [tab, setTab] = useState('All');
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState('All priorities');
  const [sort, setSort] = useState('Default order');
  const [dialog, setDialog] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleted, setDeleted] = useState(null);
  const [notice, setNotice] = useState('');
  const today = dateKey(new Date());
  const completed = tasks.filter(task => task.done).length;
  const todayCount = tasks.filter(task => task.due === today && !task.done).length;
  const progress = tasks.length ? Math.round(completed / tasks.length * 100) : 0;

  useEffect(() => {
    if (loaded === null) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); setStorageError(''); }
    catch { setStorageError('Changes could not be saved. Check browser storage space and permissions before closing this page.'); }
  }, [tasks, loaded]);
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(''), 4500);
    return () => clearTimeout(timeout);
  }, [notice]);

  const scoped = tasks.filter(task => view === 'All tasks' || (view === 'Today' && task.due === today) || (view === 'Upcoming' && task.due > today && !task.done) || (view === 'Completed' && task.done) || task.project === view);
  const visible = scoped.filter(task => (tab === 'All' || (tab === 'Active' && !task.done) || (tab === 'Done' && task.done)) && (priority === 'All priorities' || task.priority === priority) && `${task.title} ${task.notes} ${task.project}`.toLowerCase().includes(query.toLowerCase()));
  const ranks = { High: 0, Medium: 1, Low: 2 };
  visible.sort((a, b) => sort === 'Due date' ? (a.due || '9999').localeCompare(b.due || '9999') : sort === 'Priority' ? ranks[a.priority] - ranks[b.priority] : Number(a.done) - Number(b.done));

  function changeView(next) { setView(next); setTab('All'); setSidebarOpen(false); setQuery(''); setPriority('All priorities'); }
  function saveTask(values) {
    if (dialog?.task) setTasks(previous => previous.map(task => task.id === dialog.task.id ? { ...task, ...values } : task));
    else setTasks(previous => [{ ...values, id: crypto.randomUUID(), done: false }, ...previous]);
    setNotice(dialog?.task ? 'Task updated. Keep the momentum going.' : 'Task created. One small step forward.');
    setDialog(null);
  }
  function deleteTask(id) { setDeleted(tasks.find(task => task.id === id)); setTasks(previous => previous.filter(task => task.id !== id)); }

  return (
    <div className="app-shell">
      {sidebarOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <a className="brand" href="#" onClick={event => { event.preventDefault(); changeView('All tasks'); }}><span className="brand-icon"><Sun size={26} strokeWidth={1.7} /></span>daylight<span className="brand-period">.</span></a>
        <div className="workspace"><span className="workspace-avatar">M</span><div><strong>My workspace</strong><span>A little more organized</span></div><span className="workspace-marker"><Leaf size={14} /></span></div>
        <div className="nav-label">WORKSPACE</div>
        <nav aria-label="Task views">{navigation.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${view === label ? 'selected' : ''}`} onClick={() => changeView(label)}><Icon size={18} strokeWidth={1.7} /><span>{label}</span><span className="nav-count">{label === 'All tasks' ? tasks.length : label === 'Today' ? todayCount : label === 'Completed' ? completed : tasks.filter(task => task.due > today && !task.done).length}</span></button>)}</nav>
        <div className="nav-label projects-label">MY PROJECTS<span>3</span></div>
        <nav aria-label="Projects">{['Work', 'Personal', 'Learning'].map(project => <button key={project} className={`nav-item project-nav ${view === project ? 'selected' : ''}`} onClick={() => changeView(project)}><span className={`project-dot ${project.toLowerCase()}`} /><span>{project}</span><span className="nav-count">{tasks.filter(task => task.project === project && !task.done).length}</span></button>)}</nav>
        <div className="sidebar-bottom"><div className="gentle-reminder"><span className="reminder-spark">✧</span><strong>Small steps. Big things.</strong><p>You don’t have to do it all.<br />Just the next right thing.</p><div className="reminder-line" /></div><div className="local-note"><HardDrive size={14} /><span>Saved on this browser</span><span className="online-dot" /></div></div>
      </aside>
      <div className="main-shell">
        <header className="topbar"><div className="breadcrumb"><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><PanelLeftOpen size={20} /></button><span className="desktop-sidebar-icon"><PanelLeftClose size={17} /></span><span className="breadcrumb-workspace">Workspace</span><span className="breadcrumb-slash">/</span><strong>{view}</strong></div><div className="topbar-right"><span className="today-date"><CalendarDays size={14} />{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span><span className="profile-avatar" aria-label="Personal workspace">M</span></div></header>
        <main>
          <section className="page-heading"><div><div className="eyebrow"><span />A LITTLE CLARITY, EVERY DAY</div><h1>{view === 'All tasks' ? 'Make space for progress.' : view === 'Today' ? 'A fresh start, today.' : view === 'Upcoming' ? 'Good things ahead.' : view === 'Completed' ? 'Look how far you’ve come.' : `${view}, with a little clarity.`}</h1><p>Your thoughts, plans, and next steps. All in one calm place.</p></div><button className="button primary new-task" onClick={() => setDialog({})}><Plus size={18} />New task</button></section>
          {storageError && <div className="storage-error" role="alert">{storageError}</div>}
          <section className="overview" aria-label="Task overview">
            <div className="stat-card"><div className="stat-heading"><span>Total tasks</span><span className="stat-icon lavender"><ListTodo size={18} /></span></div><strong>{tasks.length}<span>tasks in your orbit</span></strong><div className="stat-footer">A little structure goes a long way.</div></div>
            <div className="stat-card"><div className="stat-heading"><span>Due today</span><span className="stat-icon peach"><CalendarDays size={18} /></span></div><strong>{todayCount}<span>things to focus on</span></strong><button className="stat-link" onClick={() => changeView('Today')}>Let’s take it one at a time<ArrowUpRight size={14} /></button></div>
            <div className="stat-card"><div className="stat-heading"><span>Completed</span><span className="stat-icon mint"><CircleCheck size={18} /></span></div><strong>{completed}<span>little wins, well earned</span></strong><div className="stat-footer"><span className="small-green-dot" />Every step counts. Keep going.</div></div>
            <div className="stat-card progress-card"><div className="stat-heading"><span>Your progress</span><span className="progress-spark">✧</span></div><strong>{progress}<em>%</em><span>of the way there</span></strong><div className="progress-track" role="progressbar" aria-label="Task completion" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /></div><div className="progress-caption">Progress, not perfection.</div></div>
          </section>
          <section className="tasks-section" aria-labelledby="tasks-title">
            <div className="section-heading"><h2 id="tasks-title">{view}<span>{scoped.length}</span></h2><span className="section-note">A plan for a clearer mind.</span></div>
            <div className="task-toolbar"><div className="tabs" aria-label="Task status">{['All', 'Active', 'Done'].map(item => <button key={item} aria-pressed={tab === item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item}{item === 'All' && <span>{scoped.length}</span>}</button>)}</div><div className="task-controls"><label className="search-box"><Search size={15} /><input type="search" aria-label="Search tasks" placeholder="Search tasks…" value={query} onChange={event => setQuery(event.target.value)} /></label><label className="select-control"><Flag size={14} /><select aria-label="Filter by priority" value={priority} onChange={event => setPriority(event.target.value)}><option>All priorities</option><option>High</option><option>Medium</option><option>Low</option></select><ChevronDown size={12} /></label><label className="select-control sort-control"><ArrowUpDown size={14} /><select aria-label="Sort tasks" value={sort} onChange={event => setSort(event.target.value)}><option>Default order</option><option>Due date</option><option>Priority</option></select><ChevronDown size={12} /></label></div></div>
            <div className="task-list"><div className="list-head"><span>Task name</span><span>Project</span><span>Priority</span><span>Due date</span><span /></div>{visible.map(task => <TaskRow key={task.id} task={task} today={today} onToggle={id => setTasks(previous => previous.map(item => item.id === id ? { ...item, done: !item.done } : item))} onEdit={task => setDialog({ task })} onDelete={deleteTask} />)}{visible.length === 0 && <div className="empty-state"><Sun size={30} strokeWidth={1.3} /><h3>{query || priority !== 'All priorities' ? 'No matching tasks' : 'A little breathing room'}</h3><p>{query || priority !== 'All priorities' ? 'Try a different search or priority.' : 'Nothing here right now. Add a task or enjoy a moment of calm.'}</p></div>}<button className="add-task-row" onClick={() => setDialog({})}><Plus size={17} />Add a new task<span>Make a little room for what’s next</span></button></div>
            <div className="list-footer"><span>Showing {visible.length} of {scoped.length} tasks</span><span><Check size={13} />{storageError ? 'Storage needs attention' : 'Your changes are saved locally'}</span></div>
          </section>
          <footer className="page-footer"><Sun size={15} strokeWidth={1.5} /><span>A little more focus. A little less noise.</span><span className="footer-brand">Made for your everyday.</span></footer>
        </main>
      </div>
      {dialog && <TaskDialog task={dialog.task} onSave={saveTask} onClose={() => setDialog(null)} />}
      {(deleted || notice) && <div className="toast" role="status"><Check size={17} /><span>{deleted ? 'Task deleted.' : notice}</span>{deleted && <button onClick={() => { setTasks(previous => [...previous, deleted]); setDeleted(null); setNotice('Task restored.'); }}>Undo</button>}<button className="icon-button" aria-label="Dismiss notification" onClick={() => { setDeleted(null); setNotice(''); }}><X size={15} /></button></div>}
    </div>
  );
}
