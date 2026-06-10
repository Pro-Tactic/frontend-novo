import { ArrowLeft, BarChart3, BrainCircuit, Target, Zap, Shield, Cpu, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoImg from "../../icon/logo-protactic.png";

export default function Sobre() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-pt-bg text-pt-text p-8 relative overflow-hidden font-sans selection:bg-pt-primary selection:text-pt-bg">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-pt-primary/5 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pt-primary/5 rounded-full blur-[100px] -z-10" />

      {/* Header / Logo Section */}
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center relative mb-16 pt-12">
        <button 
          onClick={() => navigate("/")}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-[18px] bg-pt-surface border border-pt-white/10 text-pt-text-muted hover:text-pt-primary hover:border-pt-primary/30 flex items-center justify-center transition-all shadow-xl group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>
        
        <img src={logoImg} alt="ProTactic" className="w-64 h-auto brightness-110 drop-shadow-2xl" />
      </div>

      <div className="max-w-5xl mx-auto space-y-10 pb-20">

        {/* Vision Card */}
        <div className="bg-pt-surface border border-pt-white/10 rounded-[40px] p-12 md:p-16 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pt-primary/5 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-[10px] font-black text-pt-primary uppercase tracking-[0.4em] italic mb-6">Manifesto ProTactic</h2>
            <p className="text-white leading-relaxed font-black text-xl md:text-3xl tracking-tighter italic">
              "Decodificamos a complexidade do gramado através de algoritmos de elite, 
              transformando cada byte de informação em vantagem tática absoluta."
            </p>
            <p className="text-pt-text-muted leading-relaxed font-bold text-sm md:text-base max-w-3xl uppercase tracking-wider opacity-60">
              Somos uma célula de vanguarda em Ciência da Computação, movida pela inovação radical. 
              Unimos IA tática, estatística de alta frequência e visão computacional para elevar o patamar do futebol estratégico.
            </p>
          </div>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-pt-surface border border-pt-white/10 rounded-[40px] p-10 shadow-2xl hover:border-pt-primary/40 transition-all group relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-pt-primary/5 rounded-full blur-2xl -mb-16 -mr-16" />
            <div className="w-16 h-16 bg-pt-bg border border-pt-white/5 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
              <BarChart3 className="text-pt-primary w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white mb-4 tracking-tighter uppercase italic">Inteligência de Dados</h3>
            <p className="text-pt-text-muted text-xs md:text-sm leading-relaxed font-bold uppercase tracking-widest opacity-70">
              Processamento de variáveis críticas em tempo real. Nossa arquitetura de dados 
              permite decisões cirúrgicas, mitigando riscos e exponenciando a eficácia estratégica do elenco.
            </p>
          </div>

          <div className="bg-pt-surface border border-pt-white/10 rounded-[40px] p-10 shadow-2xl hover:border-pt-primary/40 transition-all group relative overflow-hidden">
             <div className="absolute bottom-0 right-0 w-32 h-32 bg-pt-primary/5 rounded-full blur-2xl -mb-16 -mr-16" />
            <div className="w-16 h-16 bg-pt-bg border border-pt-white/5 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
              <BrainCircuit className="text-pt-primary w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white mb-4 tracking-tighter uppercase italic">Estratégia Neural</h3>
            <p className="text-pt-text-muted text-xs md:text-sm leading-relaxed font-bold uppercase tracking-widest opacity-70">
              Deep Learning aplicado à detecção de padrões invisíveis. Identificamos tendências táticas 
              adversárias antes mesmo que se manifestem no campo de batalha.
            </p>
          </div>
        </div>

        {/* Quote Block */}
        <div className="bg-pt-primary/5 border border-pt-primary/20 rounded-[40px] p-12 md:p-16 shadow-2xl text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-pt-primary/5 to-transparent pointer-events-none" />
            <div className="flex justify-center mb-8">
                 <Shield className="text-pt-primary w-12 h-12 animate-pulse" />
            </div>
            
            <p className="text-white italic text-xl md:text-2xl font-black relative z-10 tracking-tight leading-snug uppercase">
              "A VITÓRIA É O RESULTADO DA SINCRONIA PERFEITA ENTRE <br className="hidden md:block" /> 
              O INSTINTO DO TREINADOR E A PRECISÃO DA MÁQUINA."
            </p>
        </div>

        {/* Expansion Section */}
        <div className="bg-pt-surface border border-pt-white/10 rounded-[40px] p-10 md:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-12 group">
            <div className="space-y-6 flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 text-pt-primary font-black uppercase tracking-[0.3em] text-[10px] italic">
                    <Zap className="w-5 h-5 fill-pt-primary/20" />
                    <span>Expandir sua Visão</span>
                </div>
                
                <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Acesse o Ecossistema Expandido</h3>
                <p className="text-pt-text-muted text-xs font-bold uppercase tracking-widest leading-loose max-w-sm">
                    Explore nosso portal institucional para documentação tática avançada, whitepapers e parcerias estratégicas globais.
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-2 opacity-30">
                    <Cpu className="w-4 h-4 text-pt-primary" />
                    <span className="text-[8px] font-black uppercase tracking-widest">v4.0 Core</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-30">
                    <Globe className="w-4 h-4 text-pt-primary" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Global Node</span>
                  </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-[32px] shadow-2xl shadow-pt-primary/10 ring-[12px] ring-pt-primary/5 hover:scale-105 transition-transform duration-500 shrink-0">
                <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://sites.google.com/cesar.school/si-protactic/home" 
                    alt="QR Code" 
                    className="w-32 h-32 opacity-90 grayscale hover:grayscale-0 transition-all"
                />
            </div>
        </div>
      </div>

      <footer className="text-center py-12 border-t border-pt-white/5 mx-auto max-w-5xl">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-8 text-[9px] font-black text-pt-text-muted/40 uppercase tracking-[0.4em]">
                <span>Status: Operacional</span>
                <span>Disponibilidade: 99.9%</span>
                <span>Segurança: Selada</span>
            </div>
            <p className="text-[10px] text-pt-text-muted/20 font-black uppercase tracking-[0.3em]">
                © 2026 ProTactic Tactical Engine. Todos os direitos reservados.
            </p>
          </div>
      </footer>
    </div>
  );
}