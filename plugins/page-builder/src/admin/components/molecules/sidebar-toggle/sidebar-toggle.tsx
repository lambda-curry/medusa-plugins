import { SidebarLeft, SidebarRight } from "@medusajs/icons"
import { IconButton, Tooltip } from "@medusajs/ui"
import { useEditorSidebar } from "../../../providers/sidebar"

/**
 * Toggle button for showing/hiding sidebars
 */
export const SidebarToggle = ({ side }: { side: "left" | "right" }) => {
  const { toggleLeft, toggleRight } = useEditorSidebar()
  const toggle = side === "left" ? toggleLeft : toggleRight
  const Icon = side === "left" ? SidebarLeft : SidebarRight

  return (
    <Tooltip content={side === "left" ? "Toggle page editor" : "Toggle page settings"}>
    <div>
      <IconButton
        className="hidden lg:flex"
        variant="transparent"
        onClick={() => toggle("desktop")}
        size="small"
      >
        <Icon className="text-ui-fg-muted" />
      </IconButton>
      <IconButton
        className="hidden max-lg:flex"
        variant="transparent"
        onClick={() => toggle("mobile")}
        size="small"
      >
        <Icon className="text-ui-fg-muted" />
      </IconButton>
    </div>
    </Tooltip>
  )
} 