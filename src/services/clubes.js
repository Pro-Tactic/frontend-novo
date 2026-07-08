import { api } from "./api";

/**
 * Retorna os últimos jogos do time vinculado ao usuário logado.
 * @param {Object} params
 * @param {number|null} params.ligaId - ID da liga para filtro (opcional)
 * @param {number} params.limite - Quantidade de jogos (padrão 5)
 */
export async function getMeuTimeUltimosJogos({ ligaId = null, limite = 5 } = {}) {
  const params = { limite };
  if (ligaId) params.liga_id = ligaId;
  const response = await api.get("/api/v1/clubes/meu-time/ultimos-jogos", { params });
  return Array.isArray(response.data) ? response.data : [];
}

/**
 * Retorna os últimos jogos de qualquer time (ex: adversário).
 * @param {number} timeId - ID do time
 * @param {Object} params
 * @param {number|null} params.ligaId - ID da liga para filtro (opcional)
 * @param {number} params.limite - Quantidade de jogos (padrão 5)
 */
export async function getTimeUltimosJogos(timeId, { ligaId = null, limite = 5 } = {}) {
  const params = { limite };
  if (ligaId) params.liga_id = ligaId;
  const response = await api.get(`/api/v1/clubes/${timeId}/ultimos-jogos`, { params });
  return Array.isArray(response.data) ? response.data : [];
}

/**
 * Retorna todos os jogadores de um time com estatísticas individuais
 * acumuladas nos últimos N jogos.
 * @param {number} timeId - ID do time
 * @param {Object} params
 * @param {number|null} params.ligaId - ID da liga para filtro (opcional)
 * @param {number} params.limite - Últimos N jogos para acumular stats (padrão 5)
 */
export async function getJogadoresDoTime(timeId, { ligaId = null, limite = 5 } = {}) {
  const params = { limite };
  if (ligaId) params.liga_id = ligaId;
  const response = await api.get(`/api/v1/clubes/${timeId}/jogadores`, { params });
  return Array.isArray(response.data) ? response.data : [];
}
