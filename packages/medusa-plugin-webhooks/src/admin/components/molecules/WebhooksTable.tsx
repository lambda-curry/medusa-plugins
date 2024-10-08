import { ColumnDef } from "@tanstack/react-table";
import React, { useMemo, useState } from "react";

import { useAdminWebhooks } from "../../hooks/webhooks/queries";
import { DataTable } from "../organisms/data-table";
import { Webhook } from "../../../models";
import Actionables from "./Actionables";
import { Pencil, Trash } from "@medusajs/icons";
import StatusIndicator from "../fundamentals/status-indicator";

interface WebhooksTableProps {
  setRefreshTable: (callback: VoidFunction | null) => void;
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
      const finalStatus: {
        title: string;
        variant: "active" | "danger";
      } = row.original.active
        ? {
            title: "Active",
            variant: "active",
          }
        : {
            title: "Inactive",
            variant: "danger",
          };

      return (
        <>
          <StatusIndicator
            title={finalStatus.title}
            variant={finalStatus.variant}
          />
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
    pageSize: 20,
    pageIndex: 0,
  });

  const { data: subscriptionsData, refetch: refetchWebhooks } =
    useAdminWebhooks({
      limit: paginationState.pageSize,
      offset: paginationState.pageIndex * paginationState.pageSize,
    });

  const [subscriptions, totalCount] = subscriptionsData?.subscriptions ?? [];

  React.useEffect(() => {
    setRefreshTable(() => refetchWebhooks);
  }, [refetchWebhooks, setRefreshTable]);

  if (totalCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <button
          onClick={() => editWebhookModal({} as Webhook)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          type="button"
        >
          Create New Webhook
        </button>
      </div>
    );
  }

  if (!subscriptions?.length) {
    return null;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={subscriptions}
        totalRecords={totalCount}
        pagination={paginationState}
        onPaginationChange={(updater) => {
          const update =
            typeof updater === "function" ? updater(paginationState) : updater;

          setPaginationState(update);
        }}
      />
    </>
  );
};
