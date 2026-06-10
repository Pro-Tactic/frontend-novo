import { Layers, Construction, Shield, Swords, Wind, Crosshair } from "lucide-react";

const phases = [
  {
    icon: Shield,
    title: "Construção",
    desc: "Análise da saída de bola, posicionamento na primeira fase e construção de jogadas desde a defesa.",
  },
  {
    icon: Swords,
    title: "Ofensiva",
    desc: "Movimentações de ataque, tabelas, cruzamentos e finalização. Mapeamento de zonas de perigo.",
  },
  {
    icon: Wind,
    title: "Defensiva",
    desc: "Linhas de marcação, compactação, transição defensiva e cobertura de espaços.",
  },
  {
    icon: Crosshair,
    title: "Bola Parada",
    desc: "Cobranças de escanteio, faltas laterais, pênaltis e posicionamento em jogadas ensaiadas.",
  },
];

export default function TaticasAvancadas() {
  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <header className="space-y-3">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[24px] bg-pt-primary/10 flex items-center justify-center border border-pt-primary/30 shadow-xl shadow-pt-primary/10">
            <Layers className="text-pt-primary w-8 h-8" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
            Variações Táticas
          </h1>
        </div>
        <p className="text-pt-text-muted font-black text-[10px] uppercase tracking-[0.4em] ml-2">
          Análise de variações táticas por fase do jogo.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {phases.map((phase) => {
          const Icon = phase.icon;
          return (
            <div
              key={phase.title}
              className="group relative bg-pt-surface border border-pt-white/10 rounded-[40px] p-10 shadow-2xl overflow-hidden hover:border-pt-primary/30 transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-pt-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-pt-primary/10 transition-all duration-1000 pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[20px] bg-pt-primary/10 flex items-center justify-center border border-pt-primary/20 group-hover:bg-pt-primary group-hover:text-pt-bg transition-all duration-500">
                    <Icon className="w-6 h-6 text-pt-primary group-hover:text-pt-bg transition-colors" />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter group-hover:text-pt-primary transition-colors">
                    {phase.title}
                  </h2>
                </div>

                <p className="text-sm text-pt-text-muted font-medium leading-relaxed">
                  {phase.desc}
                </p>

                <div className="flex items-center gap-3 pt-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
                    <Construction className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[9px] font-black text-amber-400 uppercase tracking-[0.2em]">
                      Em Desenvolvimento
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-pt-surface border border-dashed border-pt-white/10 rounded-[40px] p-12 text-center space-y-6">
        <div className="w-20 h-20 bg-pt-bg rounded-[32px] flex items-center justify-center mx-auto border border-pt-white/10">
          <Layers className="w-10 h-10 text-pt-white/5" />
        </div>
        <p className="text-pt-text-muted font-black text-[10px] uppercase tracking-[0.4em] italic opacity-40 max-w-lg mx-auto">
          O módulo de variações táticas por fase permitirá visualizar e comparar
          diferentes estratégias em construção, ofensiva, defensiva e bola
          parada. Disponível em breve.
        </p>
      </div>
    </div>
  );
}
