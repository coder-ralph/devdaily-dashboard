import React, { useState, useRef, useEffect } from 'react'
import { StickyNote, Eye, Edit3, Save } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import WidgetCard from '../components/WidgetCard'
import { useLocalStorage } from '../hooks/useLocalStorage'

const PLACEHOLDER = `# Quick Notes

Start writing...

- Ideas
- Code snippets
- \`const hello = "world"\`
- Reminders

> Tip: supports **markdown** formatting
`

export default function NotesWidget() {
  const [notes, setNotes] = useLocalStorage('ddd-notes', '')
  const [preview, setPreview] = useState(false)
  const [saved, setSaved] = useState(false)
  const saveTimerRef = useRef(null)

  // Show "saved" indicator 800ms after last keystroke
  function handleChange(e) {
    setNotes(e.target.value)
    setSaved(false)
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => setSaved(true), 800)
  }

  useEffect(() => () => clearTimeout(saveTimerRef.current), [])

  return (
    <WidgetCard
      icon={<StickyNote size={13} className="text-purple-400" />}
      title="Dev Notes"
      badge="autosave"
      headerRight={
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-[10px] text-accent-green font-mono">
              <Save size={10} /> saved
            </span>
          )}
          <button
            onClick={() => setPreview(p => !p)}
            className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded transition-colors
              ${preview ? 'bg-surface-4 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {preview ? <Edit3 size={10} /> : <Eye size={10} />}
            {preview ? 'edit' : 'preview'}
          </button>
        </div>
      }
    >
      {preview ? (
        <div className="prose prose-invert prose-sm max-w-none min-h-[200px]
          text-gray-300 prose-headings:text-white prose-code:text-amber-300
          prose-code:bg-surface-3 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
          prose-a:text-accent-blue prose-blockquote:text-gray-500">
          <ReactMarkdown>{notes || PLACEHOLDER}</ReactMarkdown>
        </div>
      ) : (
        <textarea
          className="w-full min-h-[200px] rounded-lg text-sm font-mono leading-relaxed p-3
            outline-none resize-y transition-colors
            bg-gray-50 dark:bg-surface-2
            border border-gray-200 dark:border-white/[0.07]
            text-gray-800 dark:text-gray-200
            placeholder-gray-400 dark:placeholder-gray-700
            focus:border-accent-blue/40"
          placeholder={PLACEHOLDER}
          value={notes}
          onChange={handleChange}
          spellCheck={false}
        />
      )}
      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-gray-400 font-mono">markdown supported</span>
        <span className="text-[10px] text-gray-400 font-mono">{notes.length} chars</span>
      </div>
    </WidgetCard>
  )
}
