import { Container, Heading, Button } from "@medusajs/ui"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText } from "@medusajs/icons"
import { Link } from "react-router-dom"

const PagesPage = () => {
  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Page Builder</Heading>
      </div>
      <div className="px-6 py-4">
        <Link to="/pages/edit/test-page-id">
          <Button>View Test Page</Button>
        </Link>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Pages",
  icon: DocumentText,
})

export default PagesPage 