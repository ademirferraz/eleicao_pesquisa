import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { ArrowLeft, LogOut, CheckCircle2, Loader } from "lucide-react";

// 🔊 Função para tocar som de urna eletrônica
const playBallotSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioContext.currentTime;
    
    // Primeiro beep (mais agudo) - 800 Hz
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.connect(gain1);
    gain1.connect(audioContext.destination);
    osc1.frequency.value = 800;
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc1.start(now);
    osc1.stop(now + 0.1);
    
    // Segundo beep (mais grave) - 600 Hz
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.connect(gain2);
    gain2.connect(audioContext.destination);
    osc2.frequency.value = 600;
    gain2.gain.setValueAtTime(0, now + 0.15);
    gain2.gain.setValueAtTime(0.3, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.25);
  } catch (error) {
    console.log("Som não disponível neste navegador");
  }
};

export default function Voting() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [voter, setVoter] = useState<any>(null);
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [isVoting, setIsVoting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const storedVoter = localStorage.getItem("currentVoter");
    const storedCands = JSON.parse(localStorage.getItem("candidatos") || "[]");
    
    setCandidatos(storedCands);

    if (!storedVoter) {
      toast({
        title: "Acesso negado",
        description: "Você precisa se cadastrar primeiro.",
        variant: "destructive"
      });
      setLocation("/register");
    } else {
      setVoter(JSON.parse(storedVoter));
    }
  }, [setLocation, toast]);

  const handleVote = async () => {
    if (!selectedCandidate || !voter) return;

    setIsVoting(true);

    try {
      const candidate = candidatos.find(c => c.number === selectedCandidate);
      
      if (!candidate) {
        throw new Error("Candidato não encontrado");
      }

      // Registrar voto no localStorage
      const votes = JSON.parse(localStorage.getItem("votes") || "[]");
      const newVote = {
        candidateName: candidate.name,
        candidateNumber: candidate.number,
        estado: voter.estado,
        municipio: voter.municipio,
        bairro: voter.bairro,
        timestamp: new Date().toISOString(),
        voterCPF: voter.cpf // Armazenar CPF para evitar duplicação
      };

      votes.push(newVote);
      localStorage.setItem("votes", JSON.stringify(votes));

      // Tocar som de urna
      playBallotSound();

      // Mostrar confirmação
      setShowConfirmation(true);

      toast({
        title: "✅ Voto Registrado",
        description: `Seu voto em ${candidate.name} foi registrado com sucesso!`,
        className: "bg-green-600 text-white border-none"
      });

      // Limpar dados do eleitor
      localStorage.removeItem("currentVoter");

      // Redirecionar após 3 segundos
      setTimeout(() => {
        setLocation("/");
      }, 3000);

    } catch (error: any) {
      console.error("Erro ao registrar voto:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível registrar seu voto.",
        variant: "destructive"
      });
      setIsVoting(false);
    }
  };

  if (!voter) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </Layout>
    );
  }

  if (showConfirmation) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <CheckCircle2 className="w-20 h-20 text-green-400 mb-6 animate-bounce" />
          <h2 className="text-3xl font-bold text-white mb-2">Voto Registrado!</h2>
          <p className="text-gray-300 mb-8">Seu voto foi computado com sucesso.</p>
          <p className="text-gray-400">Redirecionando para a página inicial...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Urna Eletrônica</h1>
          <div className="flex gap-2">
            <Button onClick={() => setLocation("/")} variant="outline" className="text-white">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>
            <Button onClick={() => { localStorage.removeItem("currentVoter"); setLocation("/"); }} variant="destructive">
              <LogOut className="w-4 h-4 mr-2" /> Sair
            </Button>
          </div>
        </div>

        {/* Informações do Eleitor */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h3 className="text-white font-bold mb-4">Eleitor</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Nome</p>
              <p className="text-white font-semibold">{voter.nome}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Município</p>
              <p className="text-white font-semibold">{voter.municipio}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Bairro</p>
              <p className="text-white font-semibold">{voter.bairro}</p>
            </div>
          </div>
        </div>

        {/* Seleção de Candidato */}
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Escolha seu Candidato</h2>
          
          {candidatos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Nenhum candidato cadastrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidatos.map((candidate) => (
                <button
                  key={candidate.number}
                  onClick={() => setSelectedCandidate(candidate.number)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedCandidate === candidate.number
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/10 bg-black/20 hover:border-white/20"
                  }`}
                >
                  <div className="text-center">
                    <p className="text-4xl font-bold text-blue-400 mb-2">{candidate.number}</p>
                    <p className="text-white font-semibold text-lg">{candidate.name}</p>
                    <p className="text-gray-400 text-sm mt-2">{candidate.party || "Sem partido"}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botão Confirmar Voto */}
        <div className="flex justify-center">
          <Button
            onClick={handleVote}
            disabled={!selectedCandidate || isVoting}
            className="px-12 py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-bold"
          >
            {isVoting ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Registrando Voto...
              </>
            ) : (
              "Confirmar Voto"
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
