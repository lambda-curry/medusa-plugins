import React, { useState } from 'react';
import Modal from '../components/molecules/Modal';
import { Button, toast } from '@medusajs/ui';
import { JSONTree } from 'react-json-tree';
import { useAdminTestWebhook } from '../hooks/webhooks/mutations';
import { getErrorMessage } from '../utils/error-messages';
import Spinner from '../components/atoms/Spinner';

type WebhookTestModalProps = {
  event_type: string;
  target_url: string;
  onClose: () => void;
};

export const WebhookTestModal: React.FC<WebhookTestModalProps> = ({ event_type, target_url, onClose }) => {
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

      toast.error('Error', {
        description: getErrorMessage(error),
      });

      onClose();
    }
  };

  React.useEffect(() => {
    pingWebhook();
  }, []);

  return (
    <Modal handleClose={onClose}>
      <Modal.Body>
        <Modal.Header handleClose={onClose}>
          <div>
            <h1 className="inter-xlarge-semibold mb-2xsmall">Test Webhook</h1>
          </div>
        </Modal.Header>

        <Modal.Content>
          <div className="min-h-[400px]">
            <h3 className="inter-base-semibold pb-5">
              Testing webhook: {event_type} {'->'} {target_url}
            </h3>

            <div>
              <JSONTree
                data={testResponse}
                theme={{
                  base00: '#F9FAFB',
                  base08: '#e53935',
                  base09: '#fb8c00',
                  base0B: '#0D9488',
                  base0D: '#4F46E5',
                  extend: {
                    background: '#F9FAFB',
                  },
                }}
              />
              {!testResponse ? <Spinner size="xlarge" variant="secondary" /> : null}
            </div>
          </div>
        </Modal.Content>
        <Modal.Footer>
          <div className="flex w-full items-center justify-end gap-2">
            <Button variant="primary" size="small" onClick={onClose}>
              Done
            </Button>
          </div>
        </Modal.Footer>
      </Modal.Body>
    </Modal>
  );
};
