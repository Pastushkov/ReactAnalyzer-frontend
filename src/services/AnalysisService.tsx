import { getApiInstance } from "./api";

export const AnalysisService = {
  fetchAnalysisHistory: async () => {
    return await getApiInstance().get("/analyze");
  },
  fetchAnalysisById: async (id: string) => {
    return await getApiInstance().get(`/analyze/${id}`);
  },
  analyzeCode: async (code: string) => {
    return await getApiInstance().post("/analyze", { code });
  },
};
