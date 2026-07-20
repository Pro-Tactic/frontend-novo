import { api } from "./api";

// ─── Tática (visão unificada) ───────────────────────────────────────
export const obterTatica = async (partidaId) => {
  const response = await api.get(`/api/v1/partidas/${partidaId}/tatica/`);
  return response.data;
};

// ─── Escalação ──────────────────────────────────────────────────────
export const listarEscalacao = async (partidaId) => {
  const response = await api.get(`/api/v1/partidas/${partidaId}/escalacoes/`);
  return response.data;
};

export const atualizarPosicaoJogador = async (partidaId, jogadorId, dados) => {
  const response = await api.put(
    `/api/v1/partidas/${partidaId}/escalacoes/${jogadorId}`,
    dados
  );
  return response.data;
};

export const removerJogadorEscalacao = async (partidaId, jogadorId, tipoEscalacao) => {
  await api.delete(`/api/v1/partidas/${partidaId}/escalacoes/${jogadorId}?tipo_escalacao=${tipoEscalacao}`);
};

// ─── Relatório Tático ───────────────────────────────────────────────
export const criarRelatorioTatico = async (partidaId, dados) => {
  const response = await api.post(
    `/api/v1/partidas/${partidaId}/relatorio-tatico/`,
    dados
  );
  return response.data;
};

export const listarRelatoriosTaticos = async (partidaId) => {
  const response = await api.get(
    `/api/v1/partidas/${partidaId}/relatorio-tatico/`
  );
  return response.data;
};

export const atualizarRelatorioTatico = async (partidaId, relatorioId, dados) => {
  const response = await api.put(
    `/api/v1/partidas/${partidaId}/relatorio-tatico/${relatorioId}`,
    dados
  );
  return response.data;
};
