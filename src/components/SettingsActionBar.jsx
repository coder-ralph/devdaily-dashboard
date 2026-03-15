import React, { useState, useCallback } from 'react'
import { Github, Clock, KeyRound, CheckCircle2 } from 'lucide-react'
import CredentialDialog from './CredentialDialog'
import {
  getWakatimeKey, setWakatimeKey, clearWakatimeKey,
  getGithubToken, setGithubToken, clearGithubToken,
  maskCredential,
} from '../utils/credentialStorage'

/**
 * SettingsActionBar
 *
 * Bottom-of-dashboard section with three buttons:
 *  1. WakaTime API Key → opens credential dialog
 *  2. GitHub Token     → opens credential dialog
 *  3. GitHub Repo      → opens repo in new tab
 *
 * Uses a local `tick` counter to force a re-render after save/clear so
 * the ✓ badge reflects the new localStorage state immediately.
 */
export default function SettingsActionBar() {
  const [wakaOpen,   setWakaOpen]   = useState(false)
  const [githubOpen, setGithubOpen] = useState(false)

  // Increment to trigger re-read from localStorage after mutations
  const [tick, setTick] = useState(0)
  const refresh = useCallback(() => setTick(t => t + 1), [])

  // Read current saved state — refreshed whenever tick changes
  const wakaKey   = getWakatimeKey()
  const githubTok = getGithubToken()
  const wakaSaved   = !!wakaKey
  const githubSaved = !!githubTok

  const handleSaveWaka = useCallback((key) => {
    setWakatimeKey(key)
    refresh()
  }, [refresh])

  const handleClearWaka = useCallback(() => {
    clearWakatimeKey()
    refresh()
  }, [refresh])

  const handleSaveGH = useCallback((token) => {
    setGithubToken(token)
    refresh()
  }, [refresh])

  const handleClearGH = useCallback(() => {
    clearGithubToken()
    refresh()
  }, [refresh])

  return (
    <>
      {/* ── Settings bar ── */}
      <section
        aria-label="API credentials"
        className="mt-6 pt-5 border-t border-gray-200 dark:border-white/[0.07]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          {/* Left — label */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider
              text-gray-500 dark:text-gray-400">
              Credentials
            </p>
            <p className="text-[11px] mt-0.5 text-gray-400 dark:text-gray-600">
              Stored locally in your browser — never sent to our servers.
            </p>
          </div>

          {/* Right — action buttons */}
          <div className="flex flex-col sm:flex-row gap-2">

            {/* WakaTime key */}
            <button
              onClick={() => setWakaOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                text-xs font-medium border transition-all
                bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700
                dark:bg-surface-2 dark:hover:bg-surface-3 dark:border-white/[0.08] dark:text-gray-300"
            >
              <Clock size={13} className="text-accent-blue flex-shrink-0" />
              WakaTime API Key
              {wakaSaved && (
                <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
              )}
            </button>

            {/* GitHub token */}
            <button
              onClick={() => setGithubOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                text-xs font-medium border transition-all
                bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700
                dark:bg-surface-2 dark:hover:bg-surface-3 dark:border-white/[0.08] dark:text-gray-300"
            >
              <KeyRound size={13} className="text-purple-400 flex-shrink-0" />
              GitHub Token
              {githubSaved && (
                <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
              )}
            </button>

            {/* Repo link */}
            <a
              href="https://github.com/coder-ralph/devdaily-dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                text-xs font-medium border transition-all
                bg-gray-900 hover:bg-gray-800 border-gray-700 text-white
                dark:bg-surface-3 dark:hover:bg-surface-4 dark:border-white/[0.1] dark:text-gray-200"
            >
              <Github size={13} className="flex-shrink-0" />
              GitHub Repo
            </a>

          </div>
        </div>
      </section>

      {/* ── WakaTime dialog ── */}
      <CredentialDialog
        open={wakaOpen}
        onClose={() => setWakaOpen(false)}
        title="WakaTime API Key"
        description="Track coding time and language usage."
        inputLabel="API Key"
        saveLabel="Save Key"
        inputPlaceholder="waka_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
        docsUrl="https://wakatime.com/settings/api-key"
        docsLabel="Get your WakaTime key"
        savedMasked={wakaKey ? maskCredential(wakaKey) : null}
        onSave={handleSaveWaka}
        onClear={handleClearWaka}
      />

      {/* ── GitHub dialog ── */}
      <CredentialDialog
        open={githubOpen}
        onClose={() => setGithubOpen(false)}
        title="GitHub Personal Access Token"
        description="Raises your API rate limit from 60 to 5,000 req/hr."
        inputLabel="Personal Access Token"
        saveLabel="Save Token"
        inputPlaceholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
        docsUrl="https://github.com/settings/tokens/new?scopes=public_repo,read:user"
        docsLabel="Create a GitHub token"
        savedMasked={githubTok ? maskCredential(githubTok) : null}
        onSave={handleSaveGH}
        onClear={handleClearGH}
      />
    </>
  )
}
