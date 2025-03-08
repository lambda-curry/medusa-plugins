import { 
  createDataTableColumnHelper,
  createDataTableFilterHelper,
  DataTable,
  DataTableFilteringState,
  DataTablePaginationState,
  DataTableSortingState,
  useDataTable,
  Badge,
  Text
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

type PostItem = {
  id: string
  title: string
  handle: string
  status: "published" | "draft"
  type: string
  created_at: string
  updated_at: string
}

// Mock data function - this would be replaced with actual API calls later
const fetchPostsData = async ({
  limit = 10,
  offset = 0,
  q = "",
  status = [],
  type = [],
  order,
}: {
  limit?: number
  offset?: number
  q?: string
  status?: string[]
  type?: string[]
  order?: string
}) => {
  // Mock data
  const allData: PostItem[] = Array(30).fill(null).map((_, i) => {
    const type = i % 2 === 0 ? "post" : "page"
    return ({
    id: `${type}-${i + 1}`,
    title: `${type.charAt(0).toUpperCase() + type.slice(1)} ${i + 1}`,
    handle: `${type}-${i + 1}`,
    status: i % 3 === 0 ? "published" : "draft",
    type: type,
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
    updated_at: new Date(Date.now() - i * 43200000).toISOString(),
  })})

  // Filter by search term
  let filteredData = allData
  if (q) {
    filteredData = filteredData.filter(
      item => item.title.toLowerCase().includes(q.toLowerCase()) || 
              item.handle.toLowerCase().includes(q.toLowerCase())
    )
  }

  // Filter by status
  if (status.length > 0) {
    filteredData = filteredData.filter(item => status.includes(item.status))
  }

  // Filter by type
  if (type.length > 0) {
    filteredData = filteredData.filter(item => type.includes(item.type))
  }

  // Sort data
  if (order) {
    const [field, direction] = order.startsWith('-') 
      ? [order.substring(1), 'desc'] 
      : [order, 'asc']
    
    filteredData.sort((a, b) => {
      const aValue = a[field as keyof PostItem]
      const bValue = b[field as keyof PostItem]
      
      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }

  // Paginate
  const paginatedData = filteredData.slice(offset, offset + limit)
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  return {
    posts: paginatedData,
    count: filteredData.length,
  }
}

// Create column helper
const columnHelper = createDataTableColumnHelper<PostItem>()

// Define columns
const columns = [
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
        <Badge color={status === "published" ? "green" : "grey"} size="small">
          {status === "published" ? "Published" : "Draft"}
        </Badge>
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
]

// Create filter helper
const filterHelper = createDataTableFilterHelper<PostItem>()

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

  const { data, isLoading } = useQuery({
    queryFn: () => fetchPostsData({
      limit,
      offset,
      q: search,
      status: (filtering.status || []) as string[],
      type: (filtering.type || []) as string[],
      order: sorting ? `${sorting.desc ? "-" : ""}${sorting.id}` : undefined,
    }),
    queryKey: [["posts", limit, offset, search, filtering.status, filtering.type, sorting?.id, sorting?.desc]],
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
    onRowClick: (row) => {
      navigate(`editor/test`) // TODO: change to the actual content detail page
    },
  })

  return (
    <DataTable instance={table}>
      <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <div className="flex gap-2 justify-between w-full">
          <DataTable.FilterMenu  tooltip="Filter" />
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