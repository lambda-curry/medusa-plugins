import { Button } from "@medusajs/ui"
import { Breadcrumbs, SidebarToggle } from "../../molecules"

/**
 * Top navigation bar component for the page editor
 */
export const Topbar = () => {
  return (
    <div className="flex w-full items-center justify-between p-3">
      <div className="flex items-center gap-x-1.5">
        <SidebarToggle side="left" />
        <Breadcrumbs />
      </div>
      <div className="flex items-center gap-x-1.5">
        <Button variant="primary" size="small">Save</Button>
        <SidebarToggle side="right" />
      </div>
    </div>
  )
} 