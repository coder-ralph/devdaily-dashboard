import React from 'react'

export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex items-center gap-2 py-6 justify-center text-gray-500 text-xs font-mono">
      <svg className="animate-spin h-4 w-4 text-accent-blue" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
      </svg>
      {text}
    </div>
  )
}
