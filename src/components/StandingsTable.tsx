import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MatchDetailsModal } from './MatchDetailsModal';

export const StandingsTable = () => {
  const [data, setData] = useState<any>(null);
  const [ligas, setLigas] = useState<any[]>([]);
  const [selectedLigaId, setSelectedLigaId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPartidaId, setSelectedPartidaId] = useState<number | null>(null);

  useEffect(() => {
    // Busca as ligas do clube primeiro
    const fetchLigas = async () => {
      try {
        const response = await api.get('/ligas/meus-clubes');
        setLigas(response.data);
        if (response.data.length > 0) {
          setSelectedLigaId(response.data[0].id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Erro ao carregar ligas:", error);
        setLoading(false);
      }
    };
    fetchLigas();
  }, []);

  useEffect(() => {
    if (selectedLigaId === null) return;
    
    const fetchTable = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/ligas/${selectedLigaId}/classificacao`);
        setData(response.data);
      } catch (error) {
        console.error("Erro ao carregar classificação:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTable();
  }, [selectedLigaId]);

  if (loading && !data) return <div className="p-4 bg-white rounded-lg shadow animate-pulse h-64 mt-6"></div>;
  if (!loading && (!ligas || ligas.length === 0)) return (
      <div className="bg-white rounded-lg shadow border border-gray-100 mt-6 p-6 text-center text-gray-500">
          O seu clube não está participando de nenhuma competição.
      </div>
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100 mt-6 relative">
      <MatchDetailsModal 
        partidaId={selectedPartidaId} 
        onClose={() => setSelectedPartidaId(null)} 
      />

      <div className="px-6 py-4 border-b border-gray-100 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="text-lg font-semibold text-slate-800">Tabela de Classificação</h3>
        
        <div className="flex items-center gap-3">
          {ligas.length > 0 && (
            <select
              className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
              value={selectedLigaId || ''}
              onChange={(e) => setSelectedLigaId(Number(e.target.value))}
            >
              {ligas.map(liga => (
                <option key={liga.id} value={liga.id}>
                  {liga.nome_liga}
                </option>
              ))}
            </select>
          )}
          <button 
            onClick={() => window.location.reload()}
            className="text-sm bg-slate-200 hover:bg-slate-300 px-3 py-2 rounded transition-colors font-medium text-slate-700"
          >
            Atualizar Tabela
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto relative">
        {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                <div className="w-6 h-6 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
            </div>
        )}
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium text-center">PTS</th>
              <th className="px-4 py-3 font-medium text-center">J</th>
              <th className="px-4 py-3 font-medium text-center">V</th>
              <th className="px-4 py-3 font-medium text-center">E</th>
              <th className="px-4 py-3 font-medium text-center">D</th>
              <th className="px-4 py-3 font-medium text-center">SG</th>
              <th className="px-4 py-3 font-medium text-center">Forma</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {!data || !data.classificacao || data.classificacao.length === 0 ? (
                <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                        Nenhum dado de classificação disponível para esta liga.
                    </td>
                </tr>
            ) : (
              data.classificacao.map((item: any) => (
                <tr key={item.time.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{item.posicao}</td>
                  <td className="px-4 py-3 font-medium flex items-center gap-2">
                      {item.time.foto_clube && <img src={item.time.foto_clube} alt={item.time.nome_clube} className="w-6 h-6 object-contain" />}
                      {item.time.nome_clube}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-slate-800">{item.pontos}</td>
                  <td className="px-4 py-3 text-center">{item.jogos}</td>
                  <td className="px-4 py-3 text-center">{item.vitorias}</td>
                  <td className="px-4 py-3 text-center">{item.empates}</td>
                  <td className="px-4 py-3 text-center">{item.derrotas}</td>
                  <td className="px-4 py-3 text-center">{item.saldo_gols}</td>
                  <td className="px-4 py-3 flex justify-center gap-1">
                    {item.forma_recente && item.forma_recente.map((res: any, i: number) => (
                      <button 
                        key={i} 
                        onClick={() => setSelectedPartidaId(res.partida_id)}
                        title="Ver detalhes da partida"
                        className={`w-5 h-5 flex items-center justify-center rounded text-xs font-bold text-white hover:opacity-80 transition-opacity cursor-pointer
                          ${res.resultado === 'V' ? 'bg-green-500' : res.resultado === 'E' ? 'bg-yellow-500' : 'bg-red-500'}`}
                      >
                        {res.resultado}
                      </button>
                    ))}
                    {(!item.forma_recente || item.forma_recente.length === 0) && <span className="text-gray-300">-</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
