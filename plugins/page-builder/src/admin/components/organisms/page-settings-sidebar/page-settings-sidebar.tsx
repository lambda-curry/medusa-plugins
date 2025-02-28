/**
 * Sidebar for page settings
 */
export const PageSettingsSidebar = () => {
  return (
    <aside className="flex flex-1 flex-col justify-between overflow-y-auto">
      <PageSettingsMenu />
    </aside>
  )
}

const PageSettingsMenu = () => {
  return (
    <div>
      <h3 className="text-ui-fg-base text-sm font-medium">Page Settings</h3>
    </div>
  )
} 