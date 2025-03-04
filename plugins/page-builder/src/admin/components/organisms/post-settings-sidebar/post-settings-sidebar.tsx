import { useLoaderData } from "react-router-dom"
import { DrawerSidebarContainer } from "../sidebar-container/drawer-sidebar-container"

/**
 * Post settings sidebar component that always displays as a drawer
 * regardless of screen size
 */
export const PostSettingsSidebar = () => {
  const data = useLoaderData() as any
  const post = data?.post
  const type = post?.type ? post.type?.charAt(0).toUpperCase() + post.type?.slice(1) as string : "Post"

  return (
    <DrawerSidebarContainer side="right" title={`${type} Settings`}>
      <aside className="flex flex-1 flex-col justify-between overflow-y-auto">
        <PostSettingsMenu post={post} />
      </aside>
    </DrawerSidebarContainer>
  )
}

type PostSettingsMenuProps = {
  post: Record<string, string>
}

const PostSettingsMenu = ({ post }: PostSettingsMenuProps) => {
  return (
    <div>
      <h3 className="text-ui-fg-base text-sm font-medium">
        Settings
      </h3>
    </div>
  )
} 