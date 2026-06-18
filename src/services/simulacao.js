import { api } from "./api";

export const simularPartida = async (dadosSimulacao) => {
  const response = await api.post("/api/v1/simulacao/executar", dadosSimulacao);
  return response.data;
};
