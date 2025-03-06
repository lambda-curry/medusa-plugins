import { Container, Heading, Button } from "@medusajs/ui"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText } from "@medusajs/icons"
import { Link } from "react-router-dom"

const ContentPage = () => {
  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Content</Heading>
      </div>
      <div className="px-6 py-4">
        <Link to="editor/test-page-id">
          <Button>View Test Page</Button>
        </Link>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Content",
  icon: DocumentText,
})

export default ContentPage 