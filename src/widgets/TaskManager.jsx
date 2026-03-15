import React, { useState } from 'react'
import { CheckSquare, Plus, Trash2, Circle, CheckCircle2 } from 'lucide-react'
import WidgetCard from '../components/WidgetCard'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { uid, today } from '../utils/helpers'

const PRIORITIES = ['high', 'med', 'low']
const FILTERS = ['all', 'active', 'done']

const PRI_STYLES = {
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
  med:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
  low:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

export default function TaskManager({ onTaskComplete }) {
  const [tasks, setTasks] = useLocalStorage('ddd-tasks', [])
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('med')
  const [dueDate, setDueDate] = useState('')
  const [filter, setFilter] = useState('all')

  function addTask() {
    const trimmed = text.trim()
    if (!trimmed) return
    setTasks(prev => [{
      id: uid(),
      text: trimmed,
      done: false,
      priority,
      dueDate: dueDate || null,
      createdAt: today(),
    }, ...prev])
    setText('')
    setDueDate('')
  }

  function toggleTask(id) {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t
      const nowDone = !t.done
      if (nowDone) onTaskComplete?.()
      return { ...t, done: nowDone }
    }))
  }

  function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const filtered = tasks.filter(t =>
    filter === 'all' ? true : filter === 'active' ? !t.done : t.done
  )

  const done = tasks.filter(t => t.done).length
  const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0

  return (
    <WidgetCard
      icon={<CheckSquare size={13} className="text-accent-green" />}
      title="Task Manager"
      badge={`${done}/${tasks.length} done`}
    >
      {/* Input */}
      <div className="flex gap-2 mb-3">
        <input
          className="input-base flex-1 text-xs"
          placeholder="Add a task..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
        />
        <select
          value={priority}
          onChange={e => setPriority(e.target.value)}
          className="input-base text-xs px-2 w-16"
        >
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button onClick={addTask} className="btn-primary px-2.5">
          <Plus size={14} />
        </button>
      </div>

      {/* Due date row */}
      <div className="flex gap-2 mb-3">
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="input-base text-xs w-full"
          style={{ colorScheme: 'dark' }}
        />
      </div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-1 bg-surface-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-green rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-gray-500">{pct}%</span>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-3">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`tab-btn ${filter === f ? 'active' : ''}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
        {filtered.length === 0 && (
          <p className="text-xs text-gray-600 font-mono text-center py-3">
            {filter === 'done' ? 'No completed tasks.' : 'No tasks yet.'}
          </p>
        )}
        {filtered.map(task => (
          <div
            key={task.id}
            className={`item-row transition-opacity ${task.done ? 'opacity-50' : ''}`}
          >
            <button onClick={() => toggleTask(task.id)} className="mt-0.5 flex-shrink-0 text-gray-500 hover:text-accent-green transition-colors">
              {task.done
                ? <CheckCircle2 size={14} className="text-accent-green" />
                : <Circle size={14} />}
            </button>
            <div className="flex-1 min-w-0">
              <span className={`text-xs ${task.done ? 'line-through text-gray-600' : 'text-gray-200'}`}>
                {task.text}
              </span>
              {task.dueDate && (
                <div className="text-[10px] text-gray-600 font-mono mt-0.5">due {task.dueDate}</div>
              )}
            </div>
            <span className={`text-[9px] px-1.5 py-0.5 rounded border flex-shrink-0 ${PRI_STYLES[task.priority]}`}>
              {task.priority}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-gray-700 hover:text-red-400 transition-colors flex-shrink-0"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}
