import { PropsWithChildren, ReactNode } from "react"
import { TooltipProvider } from "@medusajs/ui"
import { MainContent } from "./main-content"

type ShellProps = PropsWithChildren & {
  leftSidebar?: ReactNode
  rightSidebar?: ReactNode
}

/**
 * Shell layout component that provides a consistent layout across the admin dashboard.
 */
export const Shell = ({ children, leftSidebar, rightSidebar }: ShellProps) => {
  return (
    <TooltipProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        {leftSidebar}
        <MainContent>{children}</MainContent>
        {rightSidebar}
      </div>
    </TooltipProvider>
  )
} 