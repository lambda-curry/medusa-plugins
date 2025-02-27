import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sdk } from "../../lib/sdk";

import { EventOptions } from "../../../common";

export interface Webhook {
  id: string;
  event_type: string;
  active: boolean;
  target_url: string;
}

export type WebhookTestPayload = Pick<Webhook, "event_type" | "target_url">;

const QUERY_KEY = ["webhooks"];

export const useAdminCreateWebhook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Omit<Webhook, "id">) => {
      return await sdk.client.fetch("/admin/webhooks", {
        method: "POST",
        body: body,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

export const useAdminUpdateWebhook = (id?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: Partial<Webhook>) => {
      return await sdk.client.fetch(`/admin/webhooks/${id}`, {
        method: "PUT",
        body,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

export const useAdminDeleteWebhook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await sdk.client.fetch(`/admin/webhooks/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

export const useAdminTestWebhook = () => {
  return useMutation({
    mutationFn: async (payload: WebhookTestPayload) => {
      return await sdk.client.fetch("/admin/webhooks/test-webhook", {
        method: "POST",
        body: payload,
      });
    },
  });
};

export const useAdminGetWebhookEvents = () => {
  return useQuery({
    queryKey: [...QUERY_KEY, "events"],
    queryFn: async () => {
      return await sdk.client.fetch<{ options: EventOptions[] }>(
        "/admin/webhooks/events",
        {
          method: "GET",
        }
      );
    },
  });
};
