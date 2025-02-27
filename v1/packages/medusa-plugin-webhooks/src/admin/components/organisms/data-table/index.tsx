import { Table, clx } from "@medusajs/ui"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  PaginationState,
  OnChangeFn,
  TableState,
} from "@tanstack/react-table"

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  className?: string
  onPaginationChange?: OnChangeFn<PaginationState>
  onSortingChange?: OnChangeFn<SortingState>
  pagination?: TableState["pagination"]
  totalRecords: number
  manualPagination?: boolean
  manualSorting?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  className,
  onPaginationChange,
  onSortingChange,
  totalRecords,
  pagination,
  manualPagination = true,
  manualSorting = true,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: onSortingChange,
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: onPaginationChange,
    manualPagination,
    manualSorting,
  })

  return (
    <>
      <div className={clx(className, "block  border-x")}>
        <Table>
          <Table.Header>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <Table.HeaderCell key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </Table.HeaderCell>
                  )
                })}
              </Table.Row>
            ))}
          </Table.Header>
          <Table.Body>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <Table.Row
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={(row.original as any)?.className ?? ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <Table.Cell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell
                  // @ts-ignore
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>
      {!!pagination && (
        <Table.Pagination
          className="mt-2"
          count={totalRecords}
          pageSize={pagination.pageSize}
          pageIndex={pagination.pageIndex}
          canPreviousPage={pagination.pageIndex != 0}
          canNextPage={
            (pagination.pageIndex + 1) * pagination.pageSize < totalRecords
          }
          pageCount={Math.ceil(totalRecords / pagination.pageSize)}
          previousPage={() => table.previousPage()}
          nextPage={() => table.nextPage()}
        />
      )}
    </>
  )
}
