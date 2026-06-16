import { useAuth } from '../../hooks/useAuth';
import { CalendarWidget } from '../../components/CalendarWidget';
import { StandingsTable } from '../../components/StandingsTable';
import { ReportsList } from '../../components/ReportsList';

export const Home = () => {
  const { user } = useAuth();
  
  // Hardcoded league ID for the MVP/basic frontend test (assuming 1 is the user's league)
  // In a real scenario, this would come from the backend or a user selection
  const LIGA_MVP_ID = 1;

  const isAnalista = user?.tipo_usuario?.tipo === 'Analista de Desempenho';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Visão Geral</h2>
        <p className="text-gray-500 mt-1">Bem-vindo(a) ao painel principal do ProTactic.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <CalendarWidget />
          
          {isAnalista && <StandingsTable />}
        </div>
        
        <div className="lg:col-span-1">
          <ReportsList />
        </div>
      </div>
    </div>
  );
};
