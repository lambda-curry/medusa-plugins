import { XMark } from "@medusajs/icons"
import { Drawer, IconButton, clx } from "@medusajs/ui"
import { PropsWithChildren } from "react"
import { useEditorSidebar } from "../../../providers/sidebar"

type DrawerSidebarContainerProps = PropsWithChildren & {
  title?: string
  side?: "left" | "right"
}

/**
 * Drawer sidebar container component that displays content in a slide-in drawer
 * Used for mobile views and for components that should always be in a drawer
 */
export const DrawerSidebarContainer = ({ title, children, side = "left" }: DrawerSidebarContainerProps) => {
  const { left, right, toggleLeft, toggleRight } = useEditorSidebar()
  
  const isOpen = side === "left" ? left.drawer : right.drawer
  const toggle = side === "left" 
    ? () => toggleLeft("drawer") 
    : () => toggleRight("drawer")

  return (
    <Drawer open={isOpen} onOpenChange={toggle}>
      <Drawer.Content
        className={clx(
          {
            "left-2": side === "left",
            "right-2": side === "right"
          }
        )}
      >
          <div className="p-3 flex justify-between">
           <Drawer.Title>{title}</Drawer.Title>
            <IconButton
              size="small"
              variant="transparent"
              className="text-ui-fg-subtle"
              onClick={toggle}
              >
              <XMark />
            </IconButton>
          </div>
          <div className="p-3">
            {children}
          </div>
      </Drawer.Content>
    </Drawer>
  )
} 