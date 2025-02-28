import { createContext } from "react"

type EditorSidebarState = {
  desktop: boolean
  mobile: boolean
}

type EditorSidebarContextValue = {
  left: EditorSidebarState
  right: EditorSidebarState
  toggleLeft: (view: "desktop" | "mobile") => void
  toggleRight: (view: "desktop" | "mobile") => void
}

export const EditorSidebarContext = createContext<EditorSidebarContextValue | null>(null)
