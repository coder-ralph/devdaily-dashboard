import React from 'react'
import { AlertCircle } from 'lucide-react'

export default function ErrorMessage({ message }) {
  return (
    <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
      <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  )
}
