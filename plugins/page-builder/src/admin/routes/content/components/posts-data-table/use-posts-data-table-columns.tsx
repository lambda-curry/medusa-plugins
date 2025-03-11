import React from "react"
import { 
  createDataTableColumnHelper,
  Badge,
  Text,
  StatusBadge
} from "@medusajs/ui"
import { PencilSquare, SquareTwoStackMini, Trash } from "@medusajs/icons"

export type PostItem = {
  id: string
  title: string
  handle: string
  status: 'published' | 'draft'
  type: string
  created_at: string
  updated_at: string
}

export type ColumnActions = {
  onEdit?: (post: PostItem) => void
  onDuplicate?: (post: PostItem) => void
  onDelete?: (post: PostItem) => void
}

const columnHelper = createDataTableColumnHelper<PostItem>()

/**
 * Hook that returns column definitions for the PostsDataTable
 */
export const usePostsDataTableColumns = (actions: ColumnActions = {}) => {
  const { onEdit, onDuplicate, onDelete } = actions

  return React.useMemo(() => [
    columnHelper.accessor("title", {
      header: "Title",
      enableSorting: true,
      sortLabel: "Title",
    }),
    columnHelper.accessor("handle", {
      header: "Handle",
      enableSorting: true,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue()
        return (
          <StatusBadge color={status === "published" ? "green" : "grey"} className="bg-transparent">
            {status === "published" ? "Published" : "Draft"}
          </StatusBadge>
        )
      },
      enableSorting: true,
    }),
    columnHelper.accessor("type", {
      header: "Type",
      enableSorting: true,
    }),
    columnHelper.accessor("created_at", {
      header: "Date Created",
      cell: ({ getValue }) => {
        const date = new Date(getValue())
        return <Text>{date.toLocaleDateString()}</Text>
      },
      enableSorting: true,
    }),
    columnHelper.accessor("updated_at", {
      header: "Last Updated",
      cell: ({ getValue }) => {
        const date = new Date(getValue())
        return <Text>{date.toLocaleDateString()}</Text>
      },
      enableSorting: true,
    }),
    columnHelper.action({
      // @ts-ignore
      actions: ({ row }) => [
        [
          {
            icon: <PencilSquare />,
            label: 'Edit',
            onClick: () => {
              if (onEdit) {
                onEdit(row.original)
              } else {
                console.log('edit', row.original.id)
              }
            },
          },
        ],
        [
          {
            icon: <SquareTwoStackMini />,
            label: 'Duplicate',
            onClick: () => {
              if (onDuplicate) {
                onDuplicate(row.original)
              } else {
                console.log('duplicate', row.original.id)
              }
            },
          },
        ],
        [
          {
            icon: <Trash />,
            label: 'Delete',
            onClick: () => {
              if (onDelete) {
                onDelete(row.original)
              } else {
                console.log('delete', row.original.id)
              }
            },
          },
        ],
      ],
    }),
  ], [onEdit, onDuplicate, onDelete])
}
