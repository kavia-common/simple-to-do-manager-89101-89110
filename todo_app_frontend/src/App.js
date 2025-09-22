import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * Ocean Professional To-Do App
 * - Blue & amber accents, subtle gradients, rounded corners, minimalist design
 * - Local state CRUD (no backend)
 * - Smooth transitions and animated interactions
 */

// Helpers
const uid = () => Math.random().toString(36).slice(2, 10);

// Types
/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {boolean} completed
 * @property {number} createdAt
 * @property {number} updatedAt
 */

// PUBLIC_INTERFACE
export default function App() {
  /** Theme handling (light/dark) */
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  /** Task state and CRUD */
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('tasks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [filter, setFilter] = useState('all'); // all | active | completed
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // PUBLIC_INTERFACE
  const addTask = (title) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const now = Date.now();
    const newTask = /** @type {Task} */ ({
      id: uid(),
      title: trimmed,
      completed: false,
      createdAt: now,
      updatedAt: now,
    });
    setTasks((prev) => [newTask, ...prev]);
    setDraft('');
  };

  // PUBLIC_INTERFACE
  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed, updatedAt: Date.now() } : t
      )
    );
  };

  // PUBLIC_INTERFACE
  const removeTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditingTitle('');
    }
  };

  // PUBLIC_INTERFACE
  const beginEdit = (task) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
  };

  // PUBLIC_INTERFACE
  const commitEdit = () => {
    const title = editingTitle.trim();
    if (!editingId) return;
    if (!title) {
      // empty title on edit deletes the task
      removeTask(editingId);
      return;
    }
    setTasks((prev) =>
      prev.map((t) => (t.id === editingId ? { ...t, title, updatedAt: Date.now() } : t))
    );
    setEditingId(null);
    setEditingTitle('');
  };

  // PUBLIC_INTERFACE
  const clearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks
      .filter((t) => {
        if (filter === 'active') return !t.completed;
        if (filter === 'completed') return t.completed;
        return true;
      })
      .filter((t) => (q ? t.title.toLowerCase().includes(q) : true));
  }, [tasks, filter, query]);

  const remaining = tasks.filter((t) => !t.completed).length;

  return (
    <div className="ocean-app">
      <header className="ocean-header">
        <div className="ocean-header-inner">
          <div className="brand">
            <div className="brand-icon" aria-hidden>✓</div>
            <h1 className="brand-title">Ocean Tasks</h1>
          </div>
          <div className="header-actions">
            <div className="search-wrap">
              <input
                aria-label="Search tasks"
                className="input search"
                placeholder="Search tasks..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn theme"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </header>

      <main className="ocean-main">
        <section className="card composer">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addTask(draft);
            }}
          >
            <input
              aria-label="New task title"
              className="input large"
              placeholder="Add a new task..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button
              type="submit"
              className="btn primary"
              disabled={!draft.trim()}
            >
              Add Task
            </button>
          </form>

          <div className="filters">
            <div className="tabs" role="tablist" aria-label="Filter tasks">
              <button
                className={`tab ${filter === 'all' ? 'active' : ''}`}
                role="tab"
                aria-selected={filter === 'all'}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={`tab ${filter === 'active' ? 'active' : ''}`}
                role="tab"
                aria-selected={filter === 'active'}
                onClick={() => setFilter('active')}
              >
                Active
              </button>
              <button
                className={`tab ${filter === 'completed' ? 'active' : ''}`}
                role="tab"
                aria-selected={filter === 'completed'}
                onClick={() => setFilter('completed')}
              >
                Completed
              </button>
            </div>
            <div className="meta">
              <span className="counter">
                {remaining} {remaining === 1 ? 'item' : 'items'} left
              </span>
              <button
                type="button"
                className="btn subtle"
                onClick={clearCompleted}
                disabled={tasks.every((t) => !t.completed)}
                title="Clear completed tasks"
              >
                Clear Completed
              </button>
            </div>
          </div>
        </section>

        <section className="card list">
          {filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🌊</div>
              <p className="empty-title">No tasks found</p>
              <p className="empty-sub">
                Add a task or adjust your search and filter.
              </p>
            </div>
          ) : (
            <ul className="tasks" aria-live="polite">
              {filtered.map((task) => (
                <li key={task.id} className={`task ${task.completed ? 'done' : ''}`}>
                  <label className="checkbox-wrap">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      aria-label={task.completed ? 'Mark as active' : 'Mark as completed'}
                    />
                    <span className="check" aria-hidden />
                  </label>

                  {editingId === task.id ? (
                    <input
                      className="input inline-edit"
                      autoFocus
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitEdit();
                        if (e.key === 'Escape') {
                          setEditingId(null);
                          setEditingTitle('');
                        }
                      }}
                      aria-label="Edit task title"
                    />
                  ) : (
                    <span
                      className="title"
                      onDoubleClick={() => beginEdit(task)}
                      title="Double-click to edit"
                    >
                      {task.title}
                    </span>
                  )}

                  <div className="row-actions">
                    <button
                      className="icon-btn amber"
                      onClick={() =>
                        editingId === task.id ? commitEdit() : beginEdit(task)
                      }
                      aria-label={editingId === task.id ? 'Save' : 'Edit'}
                      title={editingId === task.id ? 'Save' : 'Edit'}
                    >
                      {editingId === task.id ? '💾' : '✏️'}
                    </button>
                    <button
                      className="icon-btn red"
                      onClick={() => removeTask(task.id)}
                      aria-label="Delete"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="ocean-footer">
        <p>Built with Ocean Professional theme • Blue & Amber accents</p>
      </footer>
    </div>
  );
}
