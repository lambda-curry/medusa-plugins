import { LoaderFunctionArgs, useLoaderData, useParams } from "react-router-dom"
import { EditorModal, Topbar } from "../../../../components/organisms"
import { EditorSidebarProvider } from "../../../../providers/sidebar"
import { PostLayout } from "../../../../components/templates/post-layout/post-layout"

export async function loader({ params }: LoaderFunctionArgs) {
  console.log("🚀 ~ loader ~ content/editor/:id ~ params:", params)

  return {
    post: {
      id: params.id,
      title: "Test Page",
      description: "Test Page Description",
      content: "Test Page Content",
      type: "page",
    },
  }
}

const PostDetailsPage = () => {
  const { id } = useParams()
  console.log("🚀 ~ PostDetailsPage ~ id:", id)
  // const postData = useLoaderData() as Awaited<ReturnType<typeof loader>>
  // console.log("🚀 ~ PostDetailsPage ~ post:", postData)
  const pageName = "Test Page"

  return (
    <EditorSidebarProvider>
      <EditorModal open={true}>
        <EditorModal.Content>
          <EditorModal.Header>
            {/* EditorModal.Title is required by EditorModal.Content */}
            <EditorModal.Title hidden={true}>{pageName}</EditorModal.Title>
            <Topbar />
          </EditorModal.Header>
          <EditorModal.Body className="flex flex-col items-center">
            <PostLayout>
              {/* <h1>{postData.post?.title}</h1>
              <p>{postData.post?.description}</p> */}
              <h1>{pageName}</h1>
            </PostLayout>
          </EditorModal.Body>
        </EditorModal.Content>
      </EditorModal>
    </EditorSidebarProvider>
  )
}

export default PostDetailsPage 
