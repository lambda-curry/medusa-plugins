import { Response } from '@medusajs/medusa-js';
import { Webhook } from '../../../models/webhook';
import qs from 'qs';
import { useAdminCustomQuery } from 'medusa-react';

const WEBHOOK_QUERY_KEY = [`mkt_webhooks`];

export class AdminGetWebhooksParameter {
  offset = 0;
  limit = 50;
  expand?: string;
  fields?: string;
}

export interface AdminVendorWebhookRes {
  email: string;
  role: string;
  access_level: string;
}

export const useAdminWebhooks = (query?: AdminGetWebhooksParameter) => {
  const queryString = qs.stringify(query);
  const queryKey = [...WEBHOOK_QUERY_KEY, queryString];

  const path = `/admin/webhooks?${queryString}`;

  return useAdminCustomQuery<undefined, { subscriptions: [Webhook[], number] }>(path, queryKey, null, {
    keepPreviousData: true,
  });
};
