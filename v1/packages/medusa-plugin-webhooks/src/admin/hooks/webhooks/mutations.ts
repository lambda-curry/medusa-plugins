import { useAdminCustomPost, useAdminCustomDelete, useAdminCustomQuery } from 'medusa-react';
import { EventOptions } from '../../../api/admin/webhooks/events/route';

export interface Webhook {
  id: string;
  event_type: string;
  active: boolean;
  target_url: string;
}

export type WebhookTestPayload = Pick<Webhook, 'event_type' | 'target_url'>;

export const useAdminCreateWebhook = () => {
  return useAdminCustomPost<null, Webhook>(`/admin/webhooks`, ['webhooks']);
};

export const useAdminUpdateWebhook = (id?: string) => {
  return useAdminCustomPost<Partial<Webhook>, Webhook>(`/admin/webhooks/${id}`, ['webhooks', id]);
};

export const useAdminDeleteWebhook = (id: string) => {
  return useAdminCustomDelete<null>(`/admin/webhooks/${id}`, ['webhooks', id]);
};

export const useAdminTestWebhook = () => {
  return useAdminCustomPost<WebhookTestPayload, Response>(`/admin/webhooks/test`, ['webhooks', 'test']);
};

export const useAdminGetWebhookEvents = () => {
  return useAdminCustomQuery<{ options: EventOptions[] }>('/admin/webhooks/events', ['webhooks', 'events']);
};
