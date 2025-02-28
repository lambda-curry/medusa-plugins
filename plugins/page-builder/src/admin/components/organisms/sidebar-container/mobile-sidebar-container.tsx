import { XMark } from "@medusajs/icons"
import { IconButton, clx } from "@medusajs/ui"
import { Dialog as RadixDialog } from "radix-ui"
import { PropsWithChildren } from "react"
import { useTranslation } from "react-i18next"
import { useEditorSidebar } from "../../../providers/sidebar"

/**
 * Mobile sidebar container component
 */
export const MobileSidebarContainer = ({ children, side = "left" }: PropsWithChildren & { side?: "left" | "right" }) => {
  const { t } = useTranslation()
  const { left, right, toggleLeft, toggleRight } = useEditorSidebar()
  const isOpen = side === "left" ? left.mobile : right.mobile
  const toggle = side === "left" ? toggleLeft : toggleRight

  return (
    <RadixDialog.Root open={isOpen} onOpenChange={() => toggle("mobile")}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay
          className={clx(
            "bg-ui-bg-overlay fixed inset-0",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        />
        <RadixDialog.Content
          className={clx(
            "bg-ui-bg-subtle shadow-elevation-modal fixed inset-y-2 flex w-full max-w-[304px] flex-col overflow-hidden rounded-lg border",
            {
              "left-2": side === "left",
              "right-2": side === "right",
            },
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            {
              "data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2": side === "left",
              "data-[state=closed]:slide-out-to-right-1/2 data-[state=open]:slide-in-from-right-1/2": side === "right",
            },
            "duration-200"
          )}
        >
          <div className="p-3">
            <RadixDialog.Close asChild>
              <IconButton
                size="small"
                variant="transparent"
                className="text-ui-fg-subtle"
              >
                <XMark />
              </IconButton>
            </RadixDialog.Close>
            <RadixDialog.Title className="sr-only">
              {t("app.nav.accessibility.title")}
            </RadixDialog.Title>
            <RadixDialog.Description className="sr-only">
              {t("app.nav.accessibility.description")}
            </RadixDialog.Description>
          </div>
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
} 