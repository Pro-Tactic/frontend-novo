import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface MatchDetailsModalProps {
  partidaId: number | null;
  onClose: () => void;
}

export const MatchDetailsModal = ({ partidaId, onClose }: MatchDetailsModalProps) => {
  const [partida, setPartida] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (partidaId) {
      setLoading(true);
      api.get(`/partidas/${partidaId}`)
        .then(res => setPartida(res.data))
        .catch(err => console.error("Erro ao buscar detalhes da partida", err))
        .finally(() => setLoading(false));
    }
  }, [partidaId]);

  if (!partidaId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="font-semibold text-lg">Detalhes da Partida</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
              <p className="text-slate-500 text-sm">Carregando informações...</p>
            </div>
          ) : !partida ? (
            <div className="text-center py-10 text-slate-500">
              Não foi possível carregar os dados.
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Competition & Date */}
              <div className="text-center space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  {partida.competicao?.nome_liga || 'Amistoso'}
                </p>
                <p className="text-sm text-slate-500">
                  {new Date(partida.data_hora_partida).toLocaleString('pt-BR', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit'
                  })}
                </p>
                <p className="text-xs text-slate-400">
                  📍 {partida.local_partida || 'Local não definido'}
                </p>
              </div>

              {/* Scoreboard */}
              <div className="flex items-center justify-between px-4 py-6 bg-slate-50 rounded-xl border border-slate-100">
                {/* Home Team */}
                <div className="flex flex-col items-center flex-1 space-y-2">
                  {partida.time_mandante?.foto_clube ? (
                    <img src={partida.time_mandante.foto_clube} alt={partida.time_mandante.nome_clube} className="w-16 h-16 object-contain drop-shadow-md" />
                  ) : (
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 font-bold text-xl">?</div>
                  )}
                  <span className="font-semibold text-slate-800 text-center text-sm">
                    {partida.time_mandante?.nome_clube || 'TBD'}
                  </span>
                </div>

                {/* Score */}
                <div className="px-6 flex flex-col items-center justify-center">
                  <div className="flex items-center space-x-3 text-4xl font-bold text-slate-900">
                    <span>{partida.placar_mandante ?? '-'}</span>
                    <span className="text-slate-300 text-2xl">x</span>
                    <span>{partida.placar_visitante ?? '-'}</span>
                  </div>
                  {partida.is_passada && <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-200 px-2 py-0.5 rounded">Final</span>}
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center flex-1 space-y-2">
                  {partida.time_visitante?.foto_clube ? (
                    <img src={partida.time_visitante.foto_clube} alt={partida.time_visitante.nome_clube} className="w-16 h-16 object-contain drop-shadow-md" />
                  ) : (
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 font-bold text-xl">?</div>
                  )}
                  <span className="font-semibold text-slate-800 text-center text-sm">
                    {partida.time_visitante?.nome_clube || 'TBD'}
                  </span>
                </div>
              </div>

              {/* Additional Stats / Details could go here */}
              <div className="pt-4 border-t border-slate-100 text-center">
                <button 
                  onClick={onClose}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Fechar
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
