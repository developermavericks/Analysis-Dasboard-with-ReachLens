import { api } from "./client";

export async function getResults(uploadId: string, scope: "sector" | "client", scopeValue: string) {
  const res = await api.get(`/uploads/${uploadId}/results`, { params: { scope, scope_value: scopeValue } });
  return res.data;
}

export async function getScopes(uploadId: string, type: "sector" | "client" = "sector"): Promise<string[]> {
  const res = await api.get(`/uploads/${uploadId}/scopes`, { params: { type } });
  return res.data?.values ?? [];
}

export async function getArticles(uploadId: string, filters: { sentiment?: string, publication?: string, author?: string, brand?: string, scope?: string, scope_type?: string }) {
  const res = await api.get(`/uploads/${uploadId}/articles`, { params: filters });
  return res.data;
}
