import { clx } from "@medusajs/ui"
import { PropsWithChildren } from "react"
import { useEditorSidebar } from "../../../providers/sidebar"

/**
 * Desktop sidebar container component
 */
export const DesktopSidebarContainer = ({ children, side = "left" }: PropsWithChildren & { side?: "left" | "right" }) => {
  const { left, right } = useEditorSidebar()
  const isOpen = side === "left" ? left.desktop : right.desktop

  return (
    <div
      className={clx("hidden h-screen w-[220px]", {
        "lg:flex": isOpen,
        "border-r": side === "left",
        "border-l": side === "right",
      })}
    >
      {children}
    </div>
  )
} 