import { apiFetch } from "@/api/api";

export type CreateItemPayload = {
  title: string;
  condition: string;
  acquisitionDate: string;
  acquisitionCost: number;
  sellingPrice: number;
  description?: string;
  imageUrl?: string;
  note?: string;
};

type CreateItemResponse = {
  success: boolean;
  item?: {
    itemId: number;
    title: string;
    category: string;
    condition: string;
    askingPrice: number;
    status: string;
  };
  error?: string;
};

export async function createItem(payload: CreateItemPayload) {
  return apiFetch<CreateItemResponse>("/api/items", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
