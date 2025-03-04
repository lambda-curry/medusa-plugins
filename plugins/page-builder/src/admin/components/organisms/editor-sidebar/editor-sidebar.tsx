import { SquareTwoStackSolid } from "@medusajs/icons"
import { NavItem } from "../../molecules/nav-item/nav-item"
import { DrawerSidebarContainer } from "../sidebar-container/drawer-sidebar-container"
import { StaticSidebarContainer } from "../sidebar-container/static-sidebar-container"

/**
 * EditorSidebar is a responsive sidebar for the page builder
 * - Rendered as a static sidebar on desktop screens 
 * - Rendered as a drawer on mobile/smaller screens
 */
export const EditorSidebar = () => {
  const sidebarContent = (
    <aside className="flex flex-1 flex-col justify-between overflow-y-auto">
      <SectionsMenu />
    </aside>
  )

  return (
    <>
      <DrawerSidebarContainer side="left" title="Editor">
        {sidebarContent}
      </DrawerSidebarContainer>
      <StaticSidebarContainer side="left">
        {sidebarContent}
      </StaticSidebarContainer>
    </>
  )
}

const sections = [
  {
    icon: <SquareTwoStackSolid />,
    label: 'Section 1',
    to: "sections/section_id_1",
  },
  {
    icon: <SquareTwoStackSolid />,
    label: 'Section 2',
    to: "sections/section_id_2",
  },
  {
    icon: <SquareTwoStackSolid />,
    label: 'Section 3',
    to: "sections/section_id_3",
  },
  {
    icon: <SquareTwoStackSolid />,
    label: 'Section 4',
    to: "sections/section_id_4",
  },
  {
    icon: <SquareTwoStackSolid />,
    label: 'Section 5',
    to: "sections/section_id_5",
  },
]

const SectionsMenu = () => {
  return (
    <nav className="flex flex-col gap-y-1 py-5">
      {sections.map((section) => {
        return <NavItem key={section.to} {...section} />
      })}
    </nav>
  )
} 