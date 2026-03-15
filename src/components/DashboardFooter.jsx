import React, { useState } from 'react'

export default function DashboardFooter() {
  const year = new Date().getFullYear()
  const [avatarError, setAvatarError] = useState(false)

  return (
    <footer className="mt-8 pt-6 border-t border-gray-200 dark:border-white/[0.07] pb-8">

      {/* Copyright line */}
      <p className="text-xs text-center text-gray-400 dark:text-gray-600">
        &copy; {year} DevDaily Dashboard. All rights reserved.
      </p>

      {/* Author credit */}
      <div className="flex items-center justify-center mt-3">
        <a
          href="https://app.daily.dev/coderralph"
          target="_blank"
          rel="noopener noreferrer"
          title="coderralph on daily.dev"
          className="inline-flex items-center gap-2 text-xs text-gray-400 transition-colors duration-200 group dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-100"
        >
          {/* "Made with 💙 and ☕ by" */}
          <span>Made with 💙 and ☕ by</span>

          {/* Avatar or fallback initials */}
          {!avatarError ? (
            <img
              src="/image/avatar.png"
              alt="Ralph Rosael"
              width={22}
              height={22}
              onError={() => setAvatarError(true)}
              className="w-[22px] h-[22px] rounded-full object-cover
                ring-2 ring-transparent
                group-hover:ring-accent-blue
                transition-all duration-200"
            />
          ) : (
            <span
              className="w-[22px] h-[22px] rounded-full
                bg-accent-blue flex items-center justify-center
                text-[9px] font-bold text-white
                ring-2 ring-transparent
                group-hover:ring-accent-blue
                transition-all duration-200"
            >
              RR
            </span>
          )}

          {/* Name with wavy underline */}
          <span
            className="underline decoration-wavy underline-offset-[4px]
              decoration-gray-300 dark:decoration-gray-600
              group-hover:decoration-accent-blue
              transition-all duration-200"
          >
            Ralph Rosael
          </span>
        </a>
      </div>
    </footer>
  )
}
