import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { ArrowLeft, LogOut, CheckCircle2 } from "lucide-react";

// Dados dos Candidatos
const CANDIDATES = [
  { id: 10, name: "Capitão Boanerges", number: 10, image: "/images/candidate-10.jpg" },
  { id: 20, name: "Judite Alapenha", number: 20, image: "/images/candidate-20.jpg" },
  { id: 11, name: "Coronel Alexandre Bilica", number: 11, image: "/images/candidate-11.jpg" },
  { id: 40, name: "Washington Azevedo", number: 40, image: "/images/candidate-40.jpg" },
  { id: 50, name: "Daniel Godoy", number: 50, image: "/images/candidate-50.jpg" },
  { id: 15, name: "Gilvado do Sindicato", number: 15, image: "/images/candidate-15.jpg" },
];

export default function Voting() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [voter, setVoter] = useState<any>(null);

  useEffect(() => {
    const storedVoter = localStorage.getItem("currentVoter");
    if (!storedVoter) {
      toast({
        title: "Acesso negado",
        description: "Você precisa se cadastrar primeiro.",
        variant: "destructive"
      });
      setLocation("/cadastro");
    } else {
      setVoter(JSON.parse(storedVoter));
    }
  }, [setLocation, toast]);

  const handleVote = () => {
    if (!selectedCandidate) return;

    const candidate = CANDIDATES.find(c => c.id === selectedCandidate);
    
    // Salvar voto (simulação)
    const votes = JSON.parse(localStorage.getItem("votes") || "[]");
    votes.push({
      candidateId: selectedCandidate,
      candidateName: candidate?.name,
      voterRegion: voter.region,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem("votes", JSON.stringify(votes));

    toast({
      title: "Voto Computado com Sucesso!",
      description: `Você votou em ${candidate?.name}. Obrigado!`,
      className: "bg-green-600 text-white border-none"
    });

    // Limpar sessão atual
    localStorage.removeItem("currentVoter");
    setTimeout(() => setLocation("/"), 2000);
  };

  // Funções Administrativas (Simuladas aqui para o protótipo, mas deveriam estar no admin)
  const handlePartialResult = () => {
    const votes = JSON.parse(localStorage.getItem("votes") || "[]");
    const counts = votes.reduce((acc: any, vote: any) => {
      acc[vote.candidateName] = (acc[vote.candidateName] || 0) + 1;
      return acc;
    }, {});
    
    let resultText = "Resultado Parcial:\n";
    Object.entries(counts).forEach(([name, count]) => {
      resultText += `${name}: ${count} votos\n`;
    });
    
    alert(resultText || "Nenhum voto computado ainda.");
  };

  const handlePersistSimulation = () => {
    alert("Simulação estatística persistida com sucesso! (Dados salvos no LocalStorage)");
  };

  const handleClearAll = () => {
    if (confirm("Tem certeza que deseja limpar todos os votos e candidatos?")) {
      localStorage.removeItem("votes");
      alert("Sistema resetado com sucesso.");
      window.location.reload();
    }
  };

  return (
    <Layout className="py-4">
      <div className="glass-panel rounded-3xl p-6 w-full max-w-5xl mx-auto animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={() => setLocation("/cadastro")} className="text-white hover:bg-white/10 gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          <div className="text-center hidden md:block">
            <h2 className="text-2xl font-bold text-white">Cédula Eleitoral Digital</h2>
            <p className="text-sm text-gray-300">Eleitor: {voter?.name} ({voter?.region})</p>
          </div>
          <Button variant="destructive" onClick={() => setLocation("/")} className="gap-2 bg-red-500/80 hover:bg-red-600">
            <LogOut className="w-4 h-4" /> Sair
          </Button>
        </div>

        {/* Mobile Header Info */}
        <div className="md:hidden text-center mb-6">
          <h2 className="text-xl font-bold text-white">Cédula Digital</h2>
          <p className="text-xs text-gray-300">{voter?.name} - {voter?.region}</p>
        </div>

        {/* Grid de Candidatos */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {CANDIDATES.map((candidate) => (
            <div 
              key={candidate.id}
              onClick={() => setSelectedCandidate(candidate.id)}
              className={`relative group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ${
                selectedCandidate === candidate.id 
                  ? 'ring-4 ring-green-500 scale-105 shadow-[0_0_20px_rgba(0,255,0,0.3)]' 
                  : 'hover:scale-105 hover:shadow-lg opacity-80 hover:opacity-100'
              }`}
            >
              <div className="aspect-square bg-gray-800 relative">
                <img 
                  src={candidate.image} 
                  alt={candidate.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3">
                  <span className="text-3xl font-bold text-white mb-1">{candidate.number}</span>
                  <span className="text-sm font-medium text-gray-200 leading-tight">{candidate.name}</span>
                </div>
                
                {selectedCandidate === candidate.id && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg animate-in zoom-in">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Botão de Votar */}
        <div className="flex justify-center mb-8">
          <Button 
            onClick={handleVote}
            disabled={!selectedCandidate}
            className={`w-full md:w-1/2 h-16 text-xl font-bold transition-all ${
              selectedCandidate 
                ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 shadow-[0_0_30px_rgba(0,255,0,0.4)] animate-pulse' 
                : 'bg-gray-600 cursor-not-allowed opacity-50'
            }`}
          >
            {selectedCandidate ? 'CONFIRMAR VOTO' : 'SELECIONE UM CANDIDATO'}
          </Button>
        </div>

        {/* Botões de Controle (Requisitados na Tela 2) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-white/10 pt-6">
          <Button variant="outline" onClick={handlePartialResult} className="bg-blue-500/10 border-blue-500/30 text-blue-200 hover:bg-blue-500/20">
            I - Ver Resultado Parcial
          </Button>
          <Button variant="outline" onClick={handlePersistSimulation} className="bg-yellow-500/10 border-yellow-500/30 text-yellow-200 hover:bg-yellow-500/20">
            II - Persistir Simulação
          </Button>
          <Button variant="outline" onClick={handleClearAll} className="bg-red-500/10 border-red-500/30 text-red-200 hover:bg-red-500/20">
            III - Limpar Tudo
          </Button>
        </div>

      </div>
    </Layout>
  );
}
