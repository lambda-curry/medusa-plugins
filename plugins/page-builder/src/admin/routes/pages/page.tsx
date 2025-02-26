import { Container, Heading } from "@medusajs/ui"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight } from "@medusajs/icons"

const PagesPage = () => {
  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Page Builder</Heading>
      </div>
      <div className="px-6 py-4">
        Hello from the Page Builder plugin!
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Pages",
  icon: ChatBubbleLeftRight,
})



export default PagesPage 