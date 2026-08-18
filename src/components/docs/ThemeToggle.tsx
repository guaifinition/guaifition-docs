'use client'

import { useEffect, useSyncExternalStore } from 'react'

type Theme = 'dark' | 'light'

const themeEvent = 'guaifinition-theme-change'

function subscribe(onChange: () => void) {
  window.addEventListener(themeEvent, onChange)
  return () => window.removeEventListener(themeEvent, onChange)
}

function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

function getServerTheme(): Theme {
  return 'dark'
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme)

  useEffect(() => {
    const saved = window.localStorage.getItem('guaifinition-theme')
    if (saved === 'light' || saved === 'dark') {
      document.documentElement.dataset.theme = saved
      window.dispatchEvent(new Event(themeEvent))
    }
  }, [])

  function toggleTheme() {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = nextTheme
    window.localStorage.setItem('guaifinition-theme', nextTheme)
    window.dispatchEvent(new Event(themeEvent))
  }

  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`切换到${theme === 'dark' ? '浅色' : '深色'}模式`}>
      <span aria-hidden="true">{theme === 'dark' ? '☼' : '◐'}</span>
      <span>{theme === 'dark' ? '浅色' : '深色'}</span>
    </button>
  )
}
