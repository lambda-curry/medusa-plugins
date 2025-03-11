import { Button, Container } from "@medusajs/ui"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChevronDown, DocumentText } from "@medusajs/icons"
import { useNavigate } from "react-router-dom"
import { SingleColumnLayout } from "../../layouts/single-column"
import { Header } from "../../components/header"
import { PostsDataTable } from "./components/posts-data-table"

const ContentPage = () => {
  const navigate = useNavigate()

  const handleCreatePost = () => {
    navigate(`editor/test`) // TODO: change to the correct path
    // navigate(`/editor/${type}/new`)
  }

  return (
    <SingleColumnLayout>
      <Container className="divide-y p-0">
        <Header
          title="Content"
          actions={[
            {
              type: "custom",
              children: <Button variant="primary" size="small" onClick={handleCreatePost}>Create</Button>
            }
          ]}
        />
          <PostsDataTable />
      </Container>
    </SingleColumnLayout>
  )
}

export const config = defineRouteConfig({
  label: "Content",
  icon: DocumentText,
})

export default ContentPage 