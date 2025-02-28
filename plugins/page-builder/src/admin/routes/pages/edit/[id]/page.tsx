import { Button } from "@medusajs/ui"
import { LoaderFunctionArgs, useLoaderData, useParams } from "react-router-dom"
import { PageLayout } from "../../../../components/templates"
import { EditorSidebarProvider } from "../../../../providers/sidebar"
import { AnimatePresence } from "motion/react"
import { useState } from "react"
import { useEffect } from "react"
import { EditorModal, Topbar } from "../../../../components/organisms"

export async function loader({ params }: LoaderFunctionArgs) {
  // TODO fetch page

  console.log("🚀 ~ loader ~ pages/:id ~ params:", params)

  return {
    page: {
      id: params.id,
      title: "Test Page",
      description: "Test Page Description",
      content: "Test Page Content",
    },
  }
}

const PageDetailsPage = () => {
  const { id } = useParams()
  console.log("🚀 ~ PageDetailsPage ~ id:", id)
  const pageData = useLoaderData() as Awaited<ReturnType<typeof loader>>
  console.log("🚀 ~ PageDetailsPage ~ page:", pageData)

  return (
    <EditorSidebarProvider>
      <EditorModal open={true}>
        <EditorModal.Content>
          <EditorModal.Header>
            <Topbar />
          </EditorModal.Header>
          <EditorModal.Body className="flex flex-col items-center">
            <PageLayout>
              <h1>Page Details2</h1>
            </PageLayout>
          </EditorModal.Body>
        </EditorModal.Content>
      </EditorModal>
    </EditorSidebarProvider>
  )
}

export default PageDetailsPage 
