import React, { useState, useEffect, useRef } from 'react'
import { X, Eye, EyeOff, ShieldCheck, AlertTriangle } from 'lucide-react'

/**
 * CredentialDialog
 *
 * Reusable modal for entering, saving, and clearing a single credential.
 */

export default function CredentialDialog({
  open,
  onClose,
  title,
  description,
  inputLabel,
  inputPlaceholder = 'Paste your credential here',
  saveLabel = 'Save Key',
  docsUrl,
  docsLabel = 'Get your key',
  savedMasked,
  onSave,
  onClear,
}) {
  const [value, setValue]       = useState('')
  const [revealed, setRevealed] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setValue('')
      setRevealed(false)
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function handleSave() {
    const trimmed = value.trim()
    if (!trimmed) return
    onSave(trimmed)
    setValue('')
    onClose()
  }

  function handleClear() {
    onClear()
    setValue('')
    onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <style>{`
        @keyframes dialogFadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>

      <div
        className="w-full max-w-md rounded-2xl shadow-2xl
          bg-white dark:bg-surface-1
          border border-gray-200 dark:border-white/[0.08]"
        style={{ animation: 'dialogFadeIn 0.18s ease both' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between p-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-xl bg-accent-blue/10">
              <ShieldCheck size={18} className="text-accent-blue" />
            </div>
            <div>
              <h2 className="text-sm font-semibold leading-tight text-gray-900 dark:text-white">
                {title}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                {description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 ml-2 text-gray-400 transition-colors rounded hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Close dialog"
          >
            <X size={15} />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 dark:bg-white/[0.06] mx-5" />

        {/* ── Body ── */}
        <div className="p-5 space-y-4">

          {/* Saved indicator */}
          {savedMasked && (
            <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-emerald-500/10 border-emerald-500/20">
              <ShieldCheck size={13} className="flex-shrink-0 text-emerald-400" />
              <span className="flex-1 font-mono text-xs truncate text-emerald-400">{savedMasked}</span>
              <span className="text-[10px] text-emerald-600 flex-shrink-0 font-medium">saved</span>
            </div>
          )}

          {/* Input row */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {inputLabel}
              </label>
              {docsUrl && (
                <a
                  href={docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-accent-blue hover:underline font-mono"
                >
                  {docsLabel} ↗
                </a>
              )}
            </div>
            <div className="relative">
              <input
                ref={inputRef}
                type={revealed ? 'text' : 'password'}
                className="w-full pr-10 font-mono text-xs input-base"
                placeholder={inputPlaceholder}
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setRevealed(r => !r)}
                className="absolute text-gray-400 transition-colors -translate-y-1/2 right-3 top-1/2 hover:text-gray-600 dark:hover:text-gray-200"
                title={revealed ? 'Hide' : 'Reveal'}
              >
                {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Security disclaimer */}
          <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg
            bg-amber-50 dark:bg-amber-500/[0.07]
            border border-amber-200 dark:border-amber-500/20">
            <AlertTriangle size={13} className="flex-shrink-0 mt-px text-amber-500" />
            <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
              Stored only in <strong>your browser's localStorage</strong> — never
              transmitted to any server other than the API it authenticates.
              Click <strong>Clear</strong> to remove it at any time.
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-2 px-5 pb-5">
          <button
            onClick={handleClear}
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors
              text-red-400 hover:text-red-500 hover:bg-red-500/10"
          >
            Clear
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-xs btn-ghost">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!value.trim()}
              className="px-4 py-2 text-xs btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saveLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
