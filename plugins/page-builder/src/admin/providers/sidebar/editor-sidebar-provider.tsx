import { ReactNode, useState } from "react"
import { EditorSidebarContext } from "./editor-sidebar-context"

interface EditorSidebarProviderProps {
  children: ReactNode
}

export const EditorSidebarProvider = ({ children }: EditorSidebarProviderProps) => {
  const [leftSidebar, setLeftSidebar] = useState({
    desktop: true,
    mobile: false,
  })

  const [rightSidebar, setRightSidebar] = useState({
    desktop: false,
    mobile: false,
  })

  const toggleLeft = (view: "desktop" | "mobile") => {
    setLeftSidebar((prev) => ({
      ...prev,
      [view]: !prev[view],
    }))
  }

  const toggleRight = (view: "desktop" | "mobile") => {
    setRightSidebar((prev) => ({
      ...prev,
      [view]: !prev[view],
    }))
  }

  return (
    <EditorSidebarContext.Provider
      value={{
        left: leftSidebar,
        right: rightSidebar,
        toggleLeft,
        toggleRight,
      }}
    >
      {children}
    </EditorSidebarContext.Provider>
  )
}
