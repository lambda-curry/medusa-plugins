import React from "react";
import { useAdminDeleteWebhook } from "../hooks/webhooks/mutations";
import { Button, toast, Prompt } from "@medusajs/ui";
import { Webhook } from "../../models";

type WebhookModalProps = {
  onClose: () => void;
  webhook: Webhook;
};

export const WebhookDeleteModal: React.FC<WebhookModalProps> = ({
  onClose,
  webhook,
}) => {
  const deleteWebhook = useAdminDeleteWebhook(webhook.id);

  const handleDelete = () => {
    deleteWebhook.mutate(webhook.id, {
      onSuccess: () => {
        toast.success("Success", {
          description: "Webhook removed",
        });
        onClose();
      },
      onError: (error) => {
        toast.error("Error", {
          description: "Webhook Deletion Failed",
        });
        console.error(error);
        onClose();
      },
    });
  };

  return (
    <Prompt open onOpenChange={(open) => !open && onClose()}>
      <Prompt.Content>
        <Prompt.Header>
          <Prompt.Title>Delete Webhook</Prompt.Title>
          <Prompt.Description>
            Are you sure you want to delete: {webhook?.event_type} {"->"}
            {webhook?.target_url}?
          </Prompt.Description>
        </Prompt.Header>
        <Prompt.Footer>
          <div className="flex w-full items-center justify-end gap-2">
            <Prompt.Cancel>Cancel</Prompt.Cancel>
            <Prompt.Action type="button" onClick={handleDelete}>
              Delete Webhook
            </Prompt.Action>
          </div>
        </Prompt.Footer>
      </Prompt.Content>
    </Prompt>
  );
};
