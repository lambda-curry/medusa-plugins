import { ChatBubble, CheckCircle, Eye } from '@medusajs/icons';
import { DataTable, Heading, createDataTableColumnHelper, useDataTable } from '@medusajs/ui';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { useAdminListProductReviews, useAdminUpdateProductReviewStatusMutation } from '../hooks/product-review';
import { ProductReviewResponseDrawer } from './ProductReviewResponseDrawer';
import { ProductReviewDetailsDrawer } from './ProductReviewDetailsDrawer';
import { Link } from 'react-router-dom';
import { ReviewStars } from '../atoms/review-stars';
import { AdminListProductReviewsQuery, AdminProductReview } from '../../sdk/types';

const PRODUCT_REVIEW_STATUSES = ['approved', 'flagged', 'pending'] as const;
const columnHelper = createDataTableColumnHelper<AdminProductReview>();

const getColumns = (
  showColumns: string[] | undefined,
  actions: {
    setSelectedReview: (review: AdminProductReview) => void,
    setSelectedReviewForDetails: (review: AdminProductReview) => void,
    updateStatus: ({ reviewId, status }: { reviewId: string; status: 'pending' | 'approved' | 'flagged' }) => void,
  }
) => {
  const updateStatusActions = (review: AdminProductReview) => {
    return PRODUCT_REVIEW_STATUSES.filter((status) => status !== review.status).map((status) => ({
      icon: <CheckCircle className="h-4 w-4" />,
      label: `Mark as ${status}`,
      onClick: () => actions.updateStatus({ reviewId: review.id, status }),
    }));
  };
  const allColumns = [
    columnHelper.accessor('product', {
      id: 'product',
      header: 'Product',
      enableSorting: false,
      cell: ({ row }) => {
        const product = row.original.product;
        return (
          <div className="flex items-center gap-4 py-2 w-full min-w-[200px] max-w-[300px]">
            {product.thumbnail ? (
              <img className="h-8 w-8 flex-shrink-0 rounded-md my-1" src={product.thumbnail} alt={product.title} />
            ) : (
              <div className="h-8 w-8 flex-shrink-0 rounded-md bg-gray-200" />
            )}
            <div className="flex-1 min-w-0">
              <Link to={`/products/${product.id}`}>
                <span className="text-sm whitespace-normal break-words hover:underline line-clamp-3">
                  {product.title}
                </span>
              </Link>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor('order', {
      id: 'order',
      header: 'Order',
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <Link to={`/orders/${row.original.order.id}`}>
            <span className="text-sm whitespace-normal break-words hover:underline">
              #{row.original.order.display_id}
            </span>
          </Link>
        );
      },
    }),
    columnHelper.accessor('status', {
      id: 'status',
      header: 'Status',
      enableSorting: false,
      cell: ({ row }) => {
        return <span>{row.original.status}</span>;
      },
    }),
    columnHelper.accessor('created_at', {
      id: 'created_at',
      header: 'Created At',
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div className="min-w-[160px] max-w-[200px]">
            <span>{DateTime.fromISO(row.original.created_at).toFormat('LLL dd yyyy hh:mm a')}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor('name', {
      id: 'name',
      header: 'Customer',
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div className="min-w-[120px] max-w-[200px]">
            <span className="whitespace-normal break-words">{row.original.name}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor('content', {
      id: 'content',
      header: 'Review',
      enableSorting: false,
      cell: ({ row }) => {
        const rating = row.original.rating;
        const content = row.original.content;
        return (
          <div className="flex flex-col gap-2 my-2 min-w-[200px] max-w-[400px]">
            <ReviewStars rating={rating} />
            <p className="text-gray-700 whitespace-normal break-words line-clamp-3">{content}</p>
          </div>
        );
      },
    }),
    columnHelper.accessor('images', {
      id: 'images',
      header: 'Images',
      enableSorting: false,
      cell: ({ row }) => {
        return <div className="flex gap-2">{row.original.images.length}</div>;
      },
    }),
    columnHelper.accessor('response', {
      id: 'response',
      header: 'Response',
      enableSorting: false,
      cell: ({ row }) => {
        const content = row.original.response?.content;
        if (!content) {
          return (
            <div className="min-w-[160px] max-w-[300px]">
              <span className="text-gray-400">No response</span>
            </div>
          );
        }
        return (
          <div className="flex flex-col gap-2 my-2 min-w-[160px] max-w-[300px]">
            <p className="text-gray-700 whitespace-normal break-words line-clamp-3">{content}</p>
          </div>
        );
      },
    }),
    columnHelper.action({
      // @ts-ignore
      id: 'actions',
      actions: ({ row }) => [
        {
          icon: <Eye className="h-4 w-4" />,
          label: 'View details',
          onClick: () => {
            actions.setSelectedReviewForDetails(row.original);
          },
        },
        {
          icon: <ChatBubble className="h-4 w-4" />,
          label: row.original.response ? 'Edit response' : 'Add response',
          onClick: () => {
            actions.setSelectedReview(row.original);
          },
        },
        ...updateStatusActions(row.original),
      ],
    }),
  ];

  if (!showColumns) return allColumns;

  return showColumns.map((c) => allColumns.find((column) => column.id === c)).filter((c) => !!c);
};

export const ProductReviewDataTable = ({
  defaultQuery,
  showColumns,
}: { defaultQuery: AdminListProductReviewsQuery; showColumns?: string[] }) => {
  const defaultLimit = defaultQuery.limit ?? 5;
  const defaultOffset = defaultQuery.offset ?? 0;
  const [selectedReview, setSelectedReview] = useState<AdminProductReview | null>(null);
  const [selectedReviewForDetails, setSelectedReviewForDetails] = useState<AdminProductReview | null>(null);

  const [query, setQuery] = useState({ ...defaultQuery, limit: defaultLimit, offset: defaultOffset });
  const { mutate: updateStatus } = useAdminUpdateProductReviewStatusMutation();

  const { data, isLoading } = useAdminListProductReviews({ ...query, limit: defaultLimit });

  const table = useDataTable({
    columns: getColumns(showColumns, { setSelectedReview, setSelectedReviewForDetails, updateStatus }),
    data: data?.product_reviews ?? [],
    getRowId: (review) => review.id,
    rowCount: data?.count ?? 0,
    isLoading,
    search: {
      state: query.q ?? '',
      onSearchChange: (q) => {
        setQuery({ ...query, q });
      },
    },
    pagination: {
      state: {
        pageIndex: Math.floor(query.offset / query.limit),
        pageSize: query.limit,
      },
      onPaginationChange: (pagination) => {
        const newQuery = { ...query, offset: pagination.pageIndex * pagination.pageSize, limit: pagination.pageSize };
        setQuery(newQuery);
      },
    },
  });

  return (
    <>
      <DataTable instance={table}>
        <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <Heading>Product Reviews</Heading>
          <DataTable.Search />
        </DataTable.Toolbar>

        <DataTable.Table />

        <DataTable.Pagination />
      </DataTable>

      {selectedReview && (
        <ProductReviewResponseDrawer
          review={selectedReview}
          open={selectedReview !== null}
          setOpen={(open) => setSelectedReview(open ? selectedReview : null)}
        />
      )}

      {selectedReviewForDetails && (
        <ProductReviewDetailsDrawer
          review={selectedReviewForDetails}
          open={selectedReviewForDetails !== null}
          setOpen={(open) => setSelectedReviewForDetails(open ? selectedReviewForDetails : null)}
        />
      )}
    </>
  );
};
