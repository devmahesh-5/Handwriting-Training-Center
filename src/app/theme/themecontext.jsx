'use client'

import React, { createContext, useState, useEffect, useContext } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false)

  // Load saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    if(isDark){
      setIsDark(false)
      localStorage.setItem('theme', 'light')
      document.documentElement.classList.remove('dark')
    }else{
    setIsDark(true)
    localStorage.setItem('theme', 'dark')
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
    }
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Custom hook for consuming the theme context
export function useTheme() {
  return useContext(ThemeContext)
}
