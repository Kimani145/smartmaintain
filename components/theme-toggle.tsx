"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const currentTheme = resolvedTheme || theme

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      className="h-9 w-9 rounded-md shrink-0 border-border focus-visible:ring-2 focus-visible:ring-primary"
      aria-label="Toggle theme"
      title={mounted ? `Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode` : "Toggle theme"}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" aria-hidden="true" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" aria-hidden="true" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
