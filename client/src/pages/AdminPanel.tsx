import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { ArrowLeft, LogOut, Trash2, Save, FileBarChart, Users, Edit } from "lucide-react";

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [stats, setStats] = useState({ totalVotes: 0, candidates: 0 });

  useEffect(() => {
    // Carregar estatísticas iniciais
    const votes = JSON.parse(localStorage.getItem("votes") || "[]");
    // Simulação de contagem de candidatos (fixo por enquanto)
    setStats({
      totalVotes: votes.length,
      candidates: 6
    });
  }, []);

  const handlePartialResult = () => {
    const votes = JSON.parse(localStorage.getItem("votes") || "[]");
    const counts = votes.reduce((acc: any, vote: any) => {
      acc[vote.candidateName] = (acc[vote.candidateName] || 0) + 1;
      return acc;
    }, {});
    
    let resultText = "--- RESULTADO PARCIAL ---\n\n";
    Object.entries(counts).forEach(([name, count]) => {
      resultText += `${name}: ${count} votos\n`;
    });
    resultText += `\nTotal de Votos: ${votes.length}`;
    
    alert(resultText || "Nenhum voto computado ainda.");
  };

  const handlePersistSimulation = () => {
    toast({
      title: "Simulação Persistida",
      description: "Dados salvos com segurança no armazenamento local.",
      className: "bg-green-600 text-white border-none"
    });
  };

  const handleClearAll = () => {
    if (confirm("ATENÇÃO: Isso apagará TODOS os votos e reiniciará o sistema. Deseja continuar?")) {
      localStorage.removeItem("votes");
      localStorage.removeItem("currentVoter");
      setStats({ ...stats, totalVotes: 0 });
      toast({
        title: "Sistema Limpo",
        description: "Todos os dados foram apagados.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateReport = () => {
    const votes = JSON.parse(localStorage.getItem("votes") || "[]");
    
    // Agrupamento por Região
    const byRegion = votes.reduce((acc: any, vote: any) => {
      if (!acc[vote.voterRegion]) acc[vote.voterRegion] = {};
      acc[vote.voterRegion][vote.candidateName] = (acc[vote.voterRegion][vote.candidateName] || 0) + 1;
      return acc;
    }, {});

    let report = "--- RELATÓRIO GERAL ---\n\n";
    report += `Total de Votos: ${votes.length}\n\n`;
    
    report += "--- POR REGIÃO ---\n";
    Object.entries(byRegion).forEach(([region, candidates]: [string, any]) => {
      report += `\n[${region}]\n`;
      Object.entries(candidates).forEach(([name, count]) => {
        report += `  - ${name}: ${count}\n`;
      });
    });

    console.log(report);
    alert("Relatório gerado no console e pronto para exportação (Simulação).");
  };

  const handleGenerateTestVoters = () => {
    const regions = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"];
    const candidates = [
      { id: 10, name: "Capitão Boanerges" },
      { id: 20, name: "Judite Alapenha" },
      { id: 11, name: "Coronel Alexandre Bilica" },
      { id: 40, name: "Washington Azevedo" },
      { id: 50, name: "Daniel Godoy" },
      { id: 15, name: "Gilvado do Sindicato" }
    ];

    const newVotes = [];
    for (let i = 0; i < 100; i++) {
      const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
      const randomRegion = regions[Math.floor(Math.random() * regions.length)];
      
      newVotes.push({
        candidateId: randomCandidate.id,
        candidateName: randomCandidate.name,
        voterRegion: randomRegion,
        timestamp: new Date().toISOString(),
        isTest: true
      });
    }

    const currentVotes = JSON.parse(localStorage.getItem("votes") || "[]");
    localStorage.setItem("votes", JSON.stringify([...currentVotes, ...newVotes]));
    
    setStats(prev => ({ ...prev, totalVotes: prev.totalVotes + 100 }));
    
    toast({
      title: "Sucesso",
      description: "100 eleitores de teste gerados e votos computados.",
      className: "bg-blue-600 text-white border-none"
    });
  };

  return (
    <Layout>
      <div className="glass-panel rounded-3xl p-8 w-full max-w-4xl mx-auto animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation("/")} className="text-white hover:bg-white/10 gap-2">
              <ArrowLeft className="w-4 h-4" /> Sair do Painel
            </Button>
            <h2 className="text-2xl font-bold text-white">Painel Administrativo</h2>
          </div>
          <Button variant="destructive" onClick={() => setLocation("/")} className="gap-2 bg-red-500/80 hover:bg-red-600">
            <LogOut className="w-4 h-4" /> Sair do App
          </Button>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Total de Votos</h3>
            <p className="text-4xl font-bold text-white">{stats.totalVotes}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Candidatos Ativos</h3>
            <p className="text-4xl font-bold text-white">{stats.candidates}</p>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Button onClick={handleGenerateTestVoters} className="h-16 text-lg bg-purple-600/80 hover:bg-purple-500 border border-purple-400/30">
            <Users className="mr-2 h-5 w-5" /> Gerar 100 Eleitores (Teste)
          </Button>
          <Button onClick={() => setLocation("/resultados")} className="h-16 text-lg bg-blue-600/80 hover:bg-blue-500 border border-blue-400/30">
            <FileBarChart className="mr-2 h-5 w-5" /> Ver Resultados Interativos
          </Button>
        </div>

        {/* Management Controls */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Edit className="w-4 h-4" /> Gestão de Dados
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" onClick={handlePartialResult} className="bg-white/5 border-white/20 text-white hover:bg-white/10">
              I - Ver Resultado Parcial
            </Button>
            <Button variant="outline" onClick={handlePersistSimulation} className="bg-white/5 border-white/20 text-white hover:bg-white/10">
              <Save className="mr-2 h-4 w-4" /> II - Persistir Simulação
            </Button>
            <Button variant="outline" onClick={handleClearAll} className="bg-red-500/10 border-red-500/30 text-red-200 hover:bg-red-500/20">
              <Trash2 className="mr-2 h-4 w-4" /> III - Limpar Tudo
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
             <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/20">
               Editar Candidatos
             </Button>
             <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/20">
               Excluir Candidatos
             </Button>
          </div>
        </div>

      </div>
    </Layout>
  );
}
