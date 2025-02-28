import { TooltipProvider } from "@medusajs/ui"
import { PropsWithChildren, ReactNode } from "react"
import { MainContent } from "./main-content"
import { SidebarContainer } from "./sidebar-container"

interface ShellProps extends PropsWithChildren {
  leftSidebar?: ReactNode
  rightSidebar?: ReactNode
}

/**
 * Shell template component that provides the main application structure
 * Composes the layout using specialized components for each section
 */
export const Shell = ({ children, leftSidebar, rightSidebar }: ShellProps) => {
  return (
    <TooltipProvider>
      <div className="relative flex h-screen flex-col items-start overflow-hidden lg:flex-row w-full">
        <SidebarContainer side="left">{leftSidebar}</SidebarContainer>
        <MainContent>{children}</MainContent>
        <SidebarContainer side="right">{rightSidebar}</SidebarContainer>
      </div>
    </TooltipProvider>
  )
} 