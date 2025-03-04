import { PropsWithChildren } from "react"
import { Shell } from "../shell/shell"
import { EditorSidebar } from "../../organisms/editor-sidebar/editor-sidebar"
import { PostSettingsSidebar } from "../../organisms/post-settings-sidebar/post-settings-sidebar"

/**
 * Post layout template for the post editor
 * Provides the main layout structure with sidebars
 */
export const PostLayout = ({ children }: PropsWithChildren) => {
  return (
    <Shell leftSidebar={<EditorSidebar />} rightSidebar={<PostSettingsSidebar />}>
      {children}
    </Shell>
  )
} 