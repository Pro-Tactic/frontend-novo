import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { UploadCloud, FileText } from 'lucide-react';

export const ReportsList = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await api.get('/relatorios/');
      setReports(response.data);
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('titulo', file.name);
    formData.append('arquivo', file);

    try {
      await api.post('/relatorios/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchReports();
    } catch (error) {
      console.error("Erro no upload do relatório", error);
      alert("Falha no upload do relatório. Verifique se é um PDF.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const isAnalista = user?.tipo_usuario?.tipo === 'Analista de Desempenho';

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100 mt-6">
      <div className="px-6 py-4 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Relatórios de Desempenho</h3>
        {isAnalista && (
          <div>
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleUpload} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 text-sm bg-slate-900 text-white hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <UploadCloud size={16} />
              {uploading ? 'Enviando...' : 'Novo Relatório (PDF)'}
            </button>
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col h-full">
        {loading ? (
          <div className="animate-pulse h-20 bg-slate-100 rounded"></div>
        ) : reports.length === 0 ? (
          <div className="text-center py-6 text-gray-500">Nenhum relatório encontrado.</div>
        ) : (
          <div className="space-y-4 flex-1">
            <ul className="space-y-3">
              {reports.map((report) => (
                <li key={report.id} className="flex items-center justify-between p-4 bg-slate-50 border border-gray-100 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800">{report.titulo}</h4>
                      <p className="text-xs text-gray-500">{new Date(report.data_criacao).toLocaleString()}</p>
                    </div>
                  </div>
                  <a 
                    href={report.caminho_arquivo} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded"
                  >
                    Abrir PDF
                  </a>
                </li>
              ))}
            </ul>
            
            {/* Visualizador de PDF embutido para o último relatório */}
            {reports.length > 0 && (
              <div className="mt-6 flex flex-col h-[500px]">
                <div className="bg-amber-50 text-amber-800 text-xs px-3 py-2 rounded-t-lg border border-amber-200 border-b-0 flex justify-between items-center">
                    <span>Alguns PDFs externos (como os de teste) podem bloquear a visualização aqui. Use "Abrir PDF" se a tela ficar branca.</span>
                </div>
                <div className="border border-gray-200 rounded-b-lg overflow-hidden flex-1">
                  <iframe 
                    src={`${reports[0].caminho_arquivo}#view=FitH`} 
                    className="w-full h-full bg-slate-100" 
                    title="Visualizador de Relatório"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
