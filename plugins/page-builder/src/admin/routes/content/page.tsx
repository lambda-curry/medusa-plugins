import { Container } from "@medusajs/ui"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText, Pencil } from "@medusajs/icons"
import { SingleColumnLayout } from "../../layouts/single-column"
import { Header } from "../../components/header"
import { Button } from "@medusajs/ui"
import { ContentDataTable } from "./components/content-data-table"

const ContentPage = () => {
  return (
    <SingleColumnLayout>
      <Container className="divide-y p-0">
        <Header
          title="Content"
          actions={[
            {
              type: "button",
              props: {
                children: "Create",
                variant: "primary",
                onClick: () => {
                  // For now just navigate by changing window location
                  window.location.href = "/editor/new"
                },
              },
            }
          ]}
        />
        <div className="p-6">
          <ContentDataTable />
        </div>
      </Container>
    </SingleColumnLayout>
    // <Container className="divide-y p-0">
    //   <div className="flex items-center justify-between px-6 py-4">
    //     <Heading level="h2">Content</Heading>
    //     <Button size="small" >
    //       Create
    //     </Button>
    //   </div>
    //   <div className="px-6 py-4">
    //     <Link to="editor/test">
    //       <Button>View Test Page</Button>
    //     </Link>
    //   </div>
    // </Container>
  )
}

export const config = defineRouteConfig({
  label: "Content",
  icon: DocumentText,
})

export default ContentPage 