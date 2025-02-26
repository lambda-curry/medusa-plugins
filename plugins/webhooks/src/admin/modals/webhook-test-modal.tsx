import React, { useState } from "react";
import { toast, Prompt } from "@medusajs/ui";
import { JsonView, allExpanded, defaultStyles } from "react-json-view-lite";

import { useAdminTestWebhook } from "../hooks/webhooks/mutations";
import { getErrorMessage } from "../utils/error-messages";
import Spinner from "../components/atoms/Spinner";

type WebhookTestModalProps = {
  event_type: string;
  target_url: string;
  onClose: () => void;
};

export const WebhookTestModal: React.FC<WebhookTestModalProps> = ({
  event_type,
  target_url,
  onClose,
}) => {
  const testWebhook = useAdminTestWebhook();
  const [testResponse, setTestResponse] = useState<any | null>(null);

  const pingWebhook = async () => {
    try {
      const res = await testWebhook.mutateAsync({
        event_type,
        target_url,
      });

      setTestResponse(res.response);
    } catch (error) {
      console.error(error);

      toast.error("Error", {
        description: getErrorMessage(error),
      });

      onClose();
    }
  };

  React.useEffect(() => {
    pingWebhook();
  }, []);

  return (
    <Prompt open onOpenChange={(open) => !open && onClose()}>
      <Prompt.Content>
        <Prompt.Header>
          <Prompt.Title>Test Webhook</Prompt.Title>
        </Prompt.Header>

        <div className="px-6 py-4">
          <div className="min-h-[200px]">
            <h3 className="inter-base-semibold pb-5">
              Testing webhook: {event_type} {"->"} {target_url}
            </h3>

            <div>
              <JsonView
                data={testResponse}
                shouldExpandNode={allExpanded}
                style={defaultStyles}
              />

              {!testResponse ? (
                <Spinner size="xlarge" variant="secondary" />
              ) : null}
            </div>
          </div>
        </div>
        <Prompt.Footer>
          <div className="flex w-full items-center justify-end gap-2">
            <Prompt.Action onClick={onClose}>Done</Prompt.Action>
          </div>
        </Prompt.Footer>
      </Prompt.Content>
    </Prompt>
  );
};
