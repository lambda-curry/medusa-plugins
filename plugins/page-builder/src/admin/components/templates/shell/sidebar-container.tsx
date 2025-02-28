import { PropsWithChildren, ReactNode } from "react"
import { DesktopSidebarContainer, MobileSidebarContainer } from "../../organisms"

interface SidebarContainerProps extends PropsWithChildren {
  side: "left" | "right"
}

/**
 * SidebarContainer component that handles both mobile and desktop sidebar containers
 */
export const SidebarContainer = ({ children, side }: SidebarContainerProps) => {
  if (!children) {
    return null
  }
  
  return (
    <div>
      <MobileSidebarContainer side={side}>{children}</MobileSidebarContainer>
      <DesktopSidebarContainer side={side}>{children}</DesktopSidebarContainer>
    </div>
  )
} 