import { api } from "./api";

/**
 * Lista todos os jogadores do elenco do clube do usuário logado.
 * Suporta filtro opcional por posição principal.
 * @param {Object} params
 * @param {string|null} params.posicao - Filtro por posição (ex: "Atacante")
 * @returns {{ jogadores: Array, total: number }}
 */
export async function getElenco({ posicao = null } = {}) {
  const params = {};
  if (posicao) params.posicao = posicao;
  const response = await api.get("/api/v1/elenco/", { params });
  return response.data;
}

/**
 * Retorna os detalhes completos de um jogador do elenco.
 * Inclui dados pessoais, posições, estatísticas agrupadas e relatório.
 * @param {number} jogadorId - ID do jogador
 * @param {number} ultimosJogos - Número de últimos jogos para estatísticas (1-20)
 * @returns {ElencoJogadorDetalheSchema}
 */
export async function getDetalheJogador(jogadorId, ultimosJogos = 5) {
  const response = await api.get(`/api/v1/elenco/${jogadorId}`, {
    params: { ultimos_jogos: ultimosJogos },
  });
  return response.data;
}
