import {
  createDataTableFilterHelper,
  DataTable,
  DataTableFilteringState,
  DataTablePaginationState,
  DataTableSortingState,
  useDataTable,
} from '@medusajs/ui'
import { useMemo, useState } from 'react'
  import { useNavigate } from 'react-router-dom'
import { usePostsDataTableColumns } from './use-posts-data-table-columns'
import { useAdminListPosts } from '../../../../hooks/posts-queries'
import { Post, PostStatus, PostType } from '../../../../../modules/page-builder/types'

// Create filter helper
const filterHelper = createDataTableFilterHelper<Post>()

// Define filters
const filters = [
  filterHelper.accessor("status", {
    type: "select",
    label: "Status",
    options: [
      {
        label: "Published",
        value: "published",
      },
      {
        label: "Draft",
        value: "draft",
      },
    ],
  }),
  filterHelper.accessor("type", {
    type: "select",
    label: "Type",
    options: [
      {
        label: "Page",
        value: "page",
      },
      {
        label: "Post",
        value: "post",
      },
    ],
  }),
]

export const PostsDataTable = () => {
  const navigate = useNavigate()
  const limit = 10
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: limit,
    pageIndex: 0,
  })
  const [search, setSearch] = useState<string>("")
  const [filtering, setFiltering] = useState<DataTableFilteringState>({})
  const [sorting, setSorting] = useState<DataTableSortingState | null>(null)

  const offset = useMemo(() => {
    return pagination.pageIndex * limit
  }, [pagination])
  
  const statusFilters = useMemo(() => {
    return (filtering.status || []) as PostStatus[]
  }, [filtering])

  const typeFilters = useMemo(() => {
    return (filtering.type || []) as PostType[]
  }, [filtering])

  const handleEdit = (post: Post) => {
    // navigate(`/editor/${post.type}/${post.id}`)
    navigate(`editor/test`) // TODO: change to the actual content detail page
  }

  const handleDuplicate = (post: Post) => {
    console.log('duplicate post', post.id)
    // Implement duplication logic here
  }

  const handleDelete = (post: Post) => {
    console.log('delete post', post.id)
    // Implement deletion logic here
  }

  const columns = usePostsDataTableColumns({
    onEdit: handleEdit,
    onDuplicate: handleDuplicate,
    onDelete: handleDelete,
  })

  const { data, isLoading } = useAdminListPosts({
    limit,
    offset,
    q: search,
    status: statusFilters,
    type: typeFilters,
    order: sorting ? `${sorting.desc ? "-" : ""}${sorting.id}` : undefined,
  })

  const table = useDataTable({
    columns,
    data: data?.posts || [],
    getRowId: (row) => row.id,
    rowCount: data?.count || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    search: {
      state: search,
      onSearchChange: setSearch,
    },
    filtering: {
      state: filtering,
      onFilteringChange: setFiltering,
    },
    filters,
    sorting: {
      state: sorting,
      onSortingChange: setSorting,
    },
  })

  return (
    <DataTable instance={table}>
      <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <div className="flex gap-2 w-full justify-between">
          <DataTable.FilterMenu tooltip="Filter" />
          <div className="flex gap-2">
            <DataTable.Search placeholder="Search" />
            <DataTable.SortingMenu tooltip="Sort" />
          </div>
        </div>
      </DataTable.Toolbar>
      <DataTable.Table />
      <DataTable.Pagination />
    </DataTable>
  )
}
