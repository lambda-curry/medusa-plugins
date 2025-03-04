import { clx } from "@medusajs/ui"
import { PropsWithChildren } from "react"
import { useEditorSidebar } from "../../../providers/sidebar"

/**
 * Static sidebar container component that displays content in a permanent sidebar
 * Only visible on desktop (lg breakpoint and above)
 */
export const StaticSidebarContainer = ({ children, side = "left" }: PropsWithChildren & { side?: "left" | "right" }) => {
  const { left, right } = useEditorSidebar()
  const isOpen = side === "left" ? left.static : right.static

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