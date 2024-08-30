import { useState } from 'react';
import { type SettingConfig, type SettingProps } from '@medusajs/admin';
import { ArrowLeft } from '@medusajs/icons';
import { Container, Toaster } from '@medusajs/ui';
import { WebhooksTable } from '../../components/molecules/WebhooksTable';
import { Webhook } from '../../../models';
import { Plus } from '@medusajs/icons';
import Actionables from '../../components/molecules/Actionables';
import { WebhookModal } from '../../modals/webhook-modal';
import { WebhookDeleteModal } from '../../modals/webhook-delete-modal';

const Webhooks = ({ notify }: SettingProps) => {
  const [showNewWebhook, setShowNewWebhook] = useState(false);
  const [showEditWebhook, setEditWebhook] = useState<Webhook | null>(null);
  const [showDeleteWebhook, setDeleteWebhook] = useState<Webhook | null>(null);
  const [refreshTable, setRefreshTable] = useState<VoidFunction | null>(null);

  const actionables = [
    {
      label: 'Add New Event',
      onClick: () => setShowNewWebhook(true),
      icon: (
        <span className="text-grey-90">
          <Plus />
        </span>
      ),
    },
  ];

  return (
    <>
      <Toaster />
      <section className="flex flex-row justify-between items-center align-middle mb-6">
        <button className={'px-small py-small'}>
          <div className="flex gap-x-xsmall inter-grey-40 inter-small-semibold items-center text-grey-50">
            <ArrowLeft />
            <span className="ml-1">Go back</span>
          </div>
        </button>
        <Actionables actions={actionables} />
      </section>

      <Container>
        <div className="mb-3">
          <h1 className="inter-xlarge-semibold text-grey-90">Webhooks</h1>
          <p>Manage the webhooks that you are sending to third party services.</p>
        </div>
        <WebhooksTable
          editWebhookModal={setEditWebhook}
          deleteWebooksModal={setDeleteWebhook}
          setRefreshTable={setRefreshTable}
        />

        {(showNewWebhook || showEditWebhook) && (
          <WebhookModal
            onClose={() => {
              setShowNewWebhook(false);
              setEditWebhook(null);
              refreshTable?.();
            }}
            webhook={showEditWebhook}
          />
        )}

        {showDeleteWebhook && (
          <WebhookDeleteModal
            onClose={() => {
              setDeleteWebhook(null);
              refreshTable?.();
            }}
            webhook={showDeleteWebhook}
          />
        )}
      </Container>
    </>
  );
};

export const config: SettingConfig = {
  card: {
    label: 'Webooks',
    description: 'Manage your webhooks',
  },
};

export default Webhooks;
