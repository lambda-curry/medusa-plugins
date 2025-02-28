import { useContext } from "react"
import { EditorSidebarContext } from "./editor-sidebar-context"

export const useEditorSidebar = () => {
  const context = useContext(EditorSidebarContext)

  if (!context) {
    throw new Error("useEditorSidebar must be used within a EditorSidebarProvider")
  }

  return context
}
