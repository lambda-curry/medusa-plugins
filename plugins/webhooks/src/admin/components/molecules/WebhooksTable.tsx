import { ColumnDef } from "@tanstack/react-table";
import React, { Dispatch, SetStateAction, useMemo, useState } from "react";
import { Button, StatusBadge } from "@medusajs/ui";

import {
  AdminWebhooksResponse,
  useAdminWebhooks,
} from "../../hooks/webhooks/queries";
import { DataTable } from "../organisms/data-table";

import Actionables from "./Actionables";
import { Pencil, Plus, Trash } from "@medusajs/icons";
import { Webhook } from "../../hooks/webhooks/mutations";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";

type RefreshTableFn = (
  options?: RefetchOptions
) => Promise<QueryObserverResult<AdminWebhooksResponse, Error>>;

interface WebhooksTableProps {
  setRefreshTable: Dispatch<SetStateAction<RefreshTableFn | undefined>>;
  editWebhookModal: (webhook: Webhook) => void;
  deleteWebooksModal: (webhook: Webhook) => void;
}

export const columnsDef = ({
  editWebhookModal,
  deleteWebooksModal,
}: {
  editWebhookModal: (webhook: Webhook) => void;
  deleteWebooksModal: (webhook: Webhook) => void;
}): ColumnDef<Webhook>[] => [
  {
    accessorKey: "event_type",
    header: "Event Type",
  },
  {
    accessorKey: "target_url",
    header: "Target URL",
  },
  {
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.active;
      return (
        <>
          <StatusBadge color={isActive ? "green" : "red"}>
            {isActive ? "Active" : "Inactive"}
          </StatusBadge>
          {row.original.active}
        </>
      );
    },
  },
  {
    header: "Actions",
    cell: ({ row }) => {
      return (
        <Actionables
          actions={[
            {
              label: "Edit",
              onClick: () => editWebhookModal(row.original),
              icon: <Pencil />,
            },
            {
              label: "Delete",
              onClick: () => deleteWebooksModal(row.original),
              icon: <Trash />,
            },
          ]}
        />
      );
    },
  },
];

export const WebhooksTable: React.FC<WebhooksTableProps> = ({
  setRefreshTable,
  deleteWebooksModal,
  editWebhookModal,
}) => {
  const columns = useMemo(() => {
    return columnsDef({
      deleteWebooksModal,
      editWebhookModal,
    });
  }, [deleteWebooksModal, editWebhookModal]);

  const [paginationState, setPaginationState] = useState({
    pageSize: 10,
    pageIndex: 0,
  });

  const { data: subscriptionsData, refetch: refetchWebhooks } =
    useAdminWebhooks({
      limit: paginationState.pageSize,
      offset: paginationState.pageIndex * paginationState.pageSize,
    });

  React.useEffect(() => {
    setRefreshTable(() => refetchWebhooks);
  }, [refetchWebhooks, setRefreshTable]);

  const { subscriptions, count: totalCount } = subscriptionsData ?? {};

  if (totalCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Button
          onClick={() => editWebhookModal({} as Webhook)}
          className="px-4 py-2 text-white rounded transition-colors"
          type="button"
        >
          <Plus />
          Create New Webhook
        </Button>
      </div>
    );
  }

  if (!subscriptions?.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-y-4">
      <DataTable
        columns={columns}
        data={subscriptions}
        totalRecords={totalCount ?? 0}
        pagination={paginationState}
        onPaginationChange={setPaginationState}
        manualPagination={true}
      />
    </div>
  );
};
