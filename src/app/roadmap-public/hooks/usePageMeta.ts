import { useEffect } from "react"

interface PageMeta {
  title: string
}

/** Sets the browser tab title and restores the previous one when the page unmounts. */
export function usePageMeta({ title }: PageMeta): void {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title
    return () => {
      document.title = previousTitle
    }
  }, [title])
}
