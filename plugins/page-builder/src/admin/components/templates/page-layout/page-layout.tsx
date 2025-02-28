import { PropsWithChildren } from "react"
import { Shell } from "../shell/shell"
import { EditorSidebar } from "../../organisms/editor-sidebar/editor-sidebar"
import { PageSettingsSidebar } from "../../organisms/page-settings-sidebar/page-settings-sidebar"

/**
 * Page layout template for the page editor
 * Provides the main layout structure with sidebars
 */
export const PageLayout = ({ children }: PropsWithChildren) => {
  return (
    <Shell leftSidebar={<EditorSidebar />} rightSidebar={<PageSettingsSidebar />}>
      {children}
    </Shell>
  )
} 