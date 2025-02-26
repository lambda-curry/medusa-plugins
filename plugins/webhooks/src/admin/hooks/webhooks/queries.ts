import { useQuery, useQueryClient } from "@tanstack/react-query";
import { sdk } from "../../lib/sdk";
import { Webhook } from "./mutations";

const QUERY_KEY = ["webhooks"];

export interface AdminGetWebhooksParameter {
  offset?: number;
  limit?: number;
  expand?: string;
  fields?: string;
}

export interface AdminWebhooksResponse {
  subscriptions: Webhook[];
  count: number;
  limit: number;
  offset: number;
}

export const useAdminWebhooks = (params?: AdminGetWebhooksParameter) => {
  return useQuery<AdminWebhooksResponse>({
    queryKey: ["webhooks", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (params?.limit) {
        searchParams.append("limit", params.limit.toString());
      }
      if (params?.offset) {
        searchParams.append("offset", params.offset.toString());
      }
      if (params?.expand) {
        searchParams.append("expand", params.expand);
      }
      if (params?.fields) {
        searchParams.append("fields", params.fields);
      }

      const queryString = searchParams.toString();
      const url = `/admin/webhooks${queryString ? `?${queryString}` : ""}`;

      return sdk.client.fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  });
};
