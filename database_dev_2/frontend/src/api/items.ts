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

export type UpdateItemPayload = {
  title: string;
  description?: string | null;
  condition: string;
  acquisition_date: string;
  acquisition_cost: number;
  selling_price: number;
  image_url?: string | null;
  note?: string | null;
};

type UpdateItemResponse = {
  success: boolean;
  item?: {
    item_id: number;
    title: string;
    description?: string | null;
    condition: string;
    acquisition_date: string;
    acquisition_cost: number;
    selling_price: number;
    image_url?: string | null;
    note?: string | null;
  };
  error?: string;
};

export async function updateItem(itemId: number, payload: UpdateItemPayload) {
  return apiFetch<UpdateItemResponse>(`/api/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
