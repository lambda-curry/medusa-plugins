import React from "react";
import { useAdminDeleteWebhook } from "../hooks/webhooks/mutations";
import { Button, toast } from "@medusajs/ui";
import { Webhook } from "../../models/webhook";
import Modal from "../components/molecules/Modal";

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
    deleteWebhook.mutate(null, {
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
    <Modal handleClose={onClose}>
      <Modal.Body>
        <Modal.Header handleClose={onClose}>
          <div>
            <h1 className="inter-xlarge-semibold mb-2xsmall">Delete Webhook</h1>
          </div>
        </Modal.Header>
        <Modal.Content>
          <h2 className="inter-base-semibold mb-base">
            Are you sure you want to delete: {webhook?.event_type} {"->"}
            {webhook?.target_url}?
          </h2>
        </Modal.Content>
        <Modal.Footer>
          <div className="flex w-full items-center justify-end gap-2">
            <Button
              variant="secondary"
              size="small"
              type="button"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              variant="danger"
              size="small"
            >
              Delete Webhook
            </Button>
          </div>
        </Modal.Footer>
      </Modal.Body>
    </Modal>
  );
};
