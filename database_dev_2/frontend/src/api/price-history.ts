import { apiFetch } from "@/api/api";

export type CreatePriceHistoryPayload = {
  itemId: number;
  marketValue: number;
  recordedDate: string;
  source: string;
};

type CreatePriceHistoryResponse = {
  success: boolean;
  priceHistory?: {
    priceHistoryId: number;
    itemId: number;
    marketValue: number;
    recordedDate: string;
    source: string;
  };
  error?: string;
};

export async function createPriceHistory(payload: CreatePriceHistoryPayload) {
  return apiFetch<CreatePriceHistoryResponse>("/api/price-history", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
