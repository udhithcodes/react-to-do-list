import { useState, useEffect, useMemo, useRef } from 'react'
import './App.css'

const INITIAL_TASKS = [
  {
    id: 'task-1',
    title: 'Design modern task dashboard with glassmorphism',
    completed: true,
    priority: 'high',
    category: 'Work',
    createdAt: 'Today, 09:30 AM',
  },
  {
    id: 'task-2',
    title: 'Implement priority tagging and live search filters',
    completed: false,
    priority: 'high',
    category: 'Work',
    createdAt: 'Today, 11:15 AM',
  },
  {
    id: 'task-3',
    title: 'Review React 19 architecture and documentation',
    completed: false,
    priority: 'medium',
    category: 'Study',
    createdAt: 'Today, 02:40 PM',
  },
  {
    id: 'task-4',
    title: '30-minute evening walk and hydration check',
    completed: false,
    priority: 'low',
    category: 'Personal',
    createdAt: 'Today, 04:00 PM',
  },
]

const CATEGORIES = ['General', 'Work', 'Personal', 'Study']

function App() {
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('taskflow_theme') || 'dark'
  })

  // Apply theme to html root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('taskflow_theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  // Tasks state
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('taskflow_tasks')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_TASKS
  })

  useEffect(() => {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks))
  }, [tasks])

  // Form input states
  const [newTitle, setNewTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [category, setCategory] = useState('General')

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'active' | 'completed'
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Inline editing state
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const editInputRef = useRef(null)

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingId])

  // Current Date string
  const currentDateFormatted = useMemo(() => {
    const options = { weekday: 'long', month: 'short', day: 'numeric' }
    return new Date().toLocaleDateString(undefined, options)
  }, [])

  // Add task handler
  const handleAddTask = (e) => {
    e.preventDefault()
    const trimmed = newTitle.trim()
    if (!trimmed) return

    const now = new Date()
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: trimmed,
      completed: false,
      priority,
      category,
      createdAt: `Today, ${timeString}`,
    }

    setTasks((prev) => [newTask, ...prev])
    setNewTitle('')
  }

  // Toggle complete
  const handleToggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  // Delete task
  const handleDeleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    if (editingId === id) {
      setEditingId(null)
    }
  }

  // Start inline editing
  const handleStartEdit = (task) => {
    setEditingId(task.id)
    setEditingText(task.title)
  }

  // Save inline edit
  const handleSaveEdit = (id) => {
    const trimmed = editingText.trim()
    if (trimmed) {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, title: trimmed } : t))
      )
    }
    setEditingId(null)
    setEditingText('')
  }

  const handleEditKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      handleSaveEdit(id)
    } else if (e.key === 'Escape') {
      setEditingId(null)
      setEditingText('')
    }
  }

  // Clear completed
  const handleClearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.completed))
  }

  // Reset sample tasks
  const handleResetSamples = () => {
    setTasks(INITIAL_TASKS)
  }

  // Filtered tasks calculation
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Status filter
      if (activeFilter === 'active' && t.completed) return false
      if (activeFilter === 'completed' && !t.completed) return false

      // Category filter
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchTitle = t.title.toLowerCase().includes(query)
        const matchCat = t.category.toLowerCase().includes(query)
        const matchPriority = t.priority.toLowerCase().includes(query)
        if (!matchTitle && !matchCat && !matchPriority) return false
      }

      return true
    })
  }, [tasks, activeFilter, categoryFilter, searchQuery])

  // Statistics
  const totalCount = tasks.length
  const completedCount = tasks.filter((t) => t.completed).length
  const activeCount = totalCount - completedCount
  const completionPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)

  return (
    <div className="app-container">
      <main className="todo-app" id="taskflow-app">
        {/* Header */}
        <header className="app-header">
          <div className="brand-wrapper">
            <div className="brand-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <div>
              <h1 className="brand-title">TaskFlow</h1>
              <p className="brand-date">{currentDateFormatted}</p>
            </div>
          </div>
          <div className="header-actions">
            <button
              id="theme-toggle"
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle visual theme"
            >
              {theme === 'dark' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* Progress Tracker Card */}
        <section className="progress-card" aria-label="Progress tracker">
          <div className="progress-header">
            <span className="progress-title">Daily Focus</span>
            <span className="progress-stats">
              {completedCount} of {totalCount} completed ({completionPercentage}%)
            </span>
          </div>
          <div className="progress-bar-track" role="progressbar" aria-valuenow={completionPercentage} aria-valuemin="0" aria-valuemax="100">
            <div
              className="progress-bar-fill"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="progress-subtext">
            {totalCount === 0
              ? 'No tasks yet. Create your first task below!'
              : completionPercentage === 100
              ? 'Outstanding job! All tasks completed for today. 🎉'
              : `${activeCount} task${activeCount === 1 ? '' : 's'} remaining. Keep up the momentum!`}
          </p>
        </section>

        {/* Task Creation Bar */}
        <form className="task-form" onSubmit={handleAddTask}>
          <div className="input-row">
            <input
              id="task-input"
              type="text"
              className="task-input"
              placeholder="What do you need to get done?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoComplete="off"
            />
            <button
              id="add-task-btn"
              type="submit"
              className="submit-task-btn"
              disabled={!newTitle.trim()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Task
            </button>
          </div>

          <div className="form-meta-row">
            <div className="meta-group">
              <span className="meta-label">Priority:</span>
              <div className="priority-selector">
                {['low', 'medium', 'high'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    className={`priority-chip ${lvl} ${priority === lvl ? 'active' : ''}`}
                    onClick={() => setPriority(lvl)}
                  >
                    {lvl.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="meta-group">
              <span className="meta-label">Category:</span>
              <select
                id="task-category-select"
                className="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>

        {/* Search & Filter Toolbar */}
        <div className="toolbar">
          <div className="search-wrapper">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="search-input"
              type="text"
              className="search-input"
              placeholder="Search tasks, categories, priorities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="filter-row">
            <div className="filter-tabs">
              <button
                id="filter-all"
                type="button"
                className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All ({totalCount})
              </button>
              <button
                id="filter-active"
                type="button"
                className={`filter-tab ${activeFilter === 'active' ? 'active' : ''}`}
                onClick={() => setActiveFilter('active')}
              >
                Active ({activeCount})
              </button>
              <button
                id="filter-completed"
                type="button"
                className={`filter-tab ${activeFilter === 'completed' ? 'active' : ''}`}
                onClick={() => setActiveFilter('completed')}
              >
                Completed ({completedCount})
              </button>
            </div>

            <select
              id="category-filter"
              className="category-filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Task List Section */}
        <div className="task-list" id="task-list-container">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-box" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <p className="empty-title">No tasks found</p>
              <p className="empty-desc">
                {searchQuery || categoryFilter !== 'all' || activeFilter !== 'all'
                  ? 'No tasks match your current filters. Try resetting your search or filter.'
                  : 'You have zero pending tasks! Add one above to get organized.'}
              </p>
              {tasks.length === 0 && (
                <button
                  type="button"
                  className="quick-add-sample"
                  onClick={handleResetSamples}
                >
                  Load sample tasks
                </button>
              )}
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isEditing = editingId === task.id

              return (
                <div
                  key={task.id}
                  className={`task-item ${task.completed ? 'completed' : ''}`}
                  id={`item-${task.id}`}
                >
                  <div className="task-item-left">
                    <button
                      type="button"
                      className={`custom-checkbox ${task.completed ? 'checked' : ''}`}
                      onClick={() => handleToggleTask(task.id)}
                      aria-label={task.completed ? 'Mark as incomplete' : 'Mark as completed'}
                    >
                      {task.completed && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>

                    <div className="task-content">
                      {isEditing ? (
                        <input
                          ref={editInputRef}
                          type="text"
                          className="task-edit-input"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => handleEditKeyDown(e, task.id)}
                          onBlur={() => handleSaveEdit(task.id)}
                        />
                      ) : (
                        <span
                          className="task-title"
                          onDoubleClick={() => handleStartEdit(task)}
                          title="Double-click to edit task"
                        >
                          {task.title}
                        </span>
                      )}

                      <div className="task-tags">
                        <span className={`task-priority-badge ${task.priority}`}>
                          • {task.priority}
                        </span>
                        <span className="task-category-badge">{task.category}</span>
                        <span className="task-date-badge">{task.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="task-actions">
                    {isEditing ? (
                      <button
                        type="button"
                        className="action-icon-btn save"
                        onClick={() => handleSaveEdit(task.id)}
                        title="Save task"
                        aria-label="Save task"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="action-icon-btn"
                        onClick={() => handleStartEdit(task)}
                        title="Edit task"
                        aria-label="Edit task"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                      </button>
                    )}
                    <button
                      type="button"
                      className="action-icon-btn delete"
                      onClick={() => handleDeleteTask(task.id)}
                      title="Delete task"
                      aria-label="Delete task"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer info & Clear completed action */}
        <footer className="app-footer">
          <span>{activeCount} items remaining</span>
          <button
            id="clear-completed-btn"
            type="button"
            className="clear-btn"
            onClick={handleClearCompleted}
            disabled={completedCount === 0}
          >
            Clear Completed ({completedCount})
          </button>
        </footer>
      </main>
    </div>
  )
}

export default App
