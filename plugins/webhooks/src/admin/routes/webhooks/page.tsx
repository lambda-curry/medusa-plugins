import { defineRouteConfig } from "@medusajs/admin-sdk";
import { TagSolid, Plus } from "@medusajs/icons";
import { Container, Heading, Toaster } from "@medusajs/ui";
import { useState } from "react";
import { WebhooksTable } from "../../components/molecules/WebhooksTable";

import Actionables from "../../components/molecules/Actionables";
import { WebhookModal } from "../../modals/webhook-modal";
import { WebhookDeleteModal } from "../../modals/webhook-delete-modal";
import { Webhook } from "../../hooks/webhooks/mutations";
import {
  QueryClient,
  QueryClientProvider,
  QueryObserverResult,
  RefetchOptions,
} from "@tanstack/react-query";
import { AdminWebhooksResponse } from "../../hooks/webhooks/queries";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

type RefreshTableFn = (
  options?: RefetchOptions
) => Promise<QueryObserverResult<AdminWebhooksResponse, Error>>;

const WebhooksPage = () => {
  const [showNewWebhook, setShowNewWebhook] = useState(false);
  const [showEditWebhook, setEditWebhook] = useState<Webhook | null>(null);
  const [showDeleteWebhook, setDeleteWebhook] = useState<Webhook | null>(null);
  const [refreshTable, setRefreshTable] = useState<
    RefreshTableFn | undefined
  >();

  const actionables = [
    {
      label: "Add New Event",
      onClick: () => setShowNewWebhook(true),
      icon: (
        <span className="text-grey-90">
          <Plus />
        </span>
      ),
    },
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Container>
        <div className="flex flex-col gap-y-3 mb-5">
          <div className="flex items-center justify-between ">
            <div>
              <Heading>Webhooks</Heading>
            </div>
            <div>
              <Actionables actions={actionables} />
            </div>
          </div>
          <p>
            Manage the webhooks that you are sending to third party services.
          </p>
        </div>

        <WebhooksTable
          editWebhookModal={setEditWebhook}
          deleteWebooksModal={setDeleteWebhook}
          setRefreshTable={setRefreshTable}
        />

        {(showNewWebhook || showEditWebhook) && (
          <WebhookModal
            open={Boolean(showNewWebhook || showEditWebhook)}
            onOpenChange={(open) => {
              if (!open) {
                setShowNewWebhook(false);
                setEditWebhook(null);
                refreshTable?.({});
              }
            }}
            webhook={showEditWebhook}
          />
        )}

        {showDeleteWebhook && (
          <WebhookDeleteModal
            onClose={() => {
              setDeleteWebhook(null);
              refreshTable?.({});
            }}
            webhook={showDeleteWebhook}
          />
        )}
      </Container>
    </QueryClientProvider>
  );
};

export const config = defineRouteConfig({
  label: "Webhooks",
  icon: TagSolid,
});

export default WebhooksPage;
