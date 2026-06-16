import { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { api } from '../services/api';
import { MatchDetailsModal } from './MatchDetailsModal';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export const CalendarWidget = () => {
  const [partidas, setPartidas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartidaId, setSelectedPartidaId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCalendario = async () => {
      try {
        // Fetch 3 months back and 6 months forward for a broad calendar view
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 6, 0);

        const response = await api.get('/partidas/calendario', {
          params: {
            data_inicio: start.toISOString().split('T')[0],
            data_fim: end.toISOString().split('T')[0],
          }
        });
        setPartidas(response.data);
      } catch (error) {
        console.error("Erro ao carregar calendário:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendario();
  }, []);

  const events = useMemo(() => {
    return partidas.map(p => {
      const data = new Date(p.data_hora_partida);
      // Calendar events usually require start and end Date objects
      const endDate = new Date(data.getTime() + 2 * 60 * 60 * 1000); // add 2 hours
      
      const title = `${p.time_mandante?.nome_clube || 'TBD'} ${p.placar_mandante} x ${p.placar_visitante} ${p.time_visitante?.nome_clube || 'TBD'}`;
      
      return {
        id: p.id,
        title: title,
        start: data,
        end: endDate,
        resource: p
      };
    });
  }, [partidas]);

  const handleSelectEvent = useCallback((event: any) => {
    setSelectedPartidaId(event.id);
  }, []);

  const eventStyleGetter = (event: any) => {
    const isPast = event.resource.is_passada;
    return {
      style: {
        backgroundColor: isPast ? '#64748b' : '#3b82f6', // slate-500 for past, blue-500 for future
        borderRadius: '4px',
        opacity: isPast ? 0.7 : 1,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '12px'
      }
    };
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-100 flex flex-col h-[600px]">
      <MatchDetailsModal 
        partidaId={selectedPartidaId} 
        onClose={() => setSelectedPartidaId(null)} 
      />
      
      <div className="px-6 py-4 border-b border-gray-100 bg-slate-50 flex justify-between items-center shrink-0">
        <h3 className="text-lg font-semibold text-slate-800">Calendário de Jogos</h3>
      </div>
      
      <div className="p-4 flex-1 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
          </div>
        )}
        
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          culture="pt-BR"
          messages={{
            next: "Próximo",
            previous: "Anterior",
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
            agenda: "Agenda",
            date: "Data",
            time: "Hora",
            event: "Evento",
            noEventsInRange: "Não há jogos neste período."
          }}
          defaultView={Views.MONTH}
          views={['month', 'week', 'day', 'agenda']}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          popup
        />
      </div>
    </div>
  );
};
