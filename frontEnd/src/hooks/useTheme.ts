import { useEffect } from 'react'
import { usePannyStore } from '../store/usePannyStore'

export default function useTheme() {
  const theme = usePannyStore((s) => s.theme)
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [theme])
}
