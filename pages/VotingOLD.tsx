import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { CheckCircle2, Loader } from "lucide-react";

const playBallotSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioContext.currentTime;
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.connect(gain1);
    gain1.connect(audioContext.destination);
    osc1.frequency.value = 800;
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc1.start(now);
    osc1.stop(now + 0.1);
  } catch (e) {
    console.log("Som indisponível");
  }
};

export default function Voting() {
  const [, setLocation] = useLocation();

  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [voter, setVoter] = useState<any>(null);
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [isVoting, setIsVoting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const storedVoter = localStorage.getItem("currentVoter");

    // CANDIDATOS FIXOS PARA FUNCIONAR LOCAL
    const listaRecuperacao = [
      { number: 10, name: "Candidato de Teste 1", party: "Partido A", photo: "" },
      { number: 20, name: "Candidato de Teste 2", party: "Partido B", photo: "" },
      { number: 30, name: "Candidato de Teste 3", party: "Partido C", photo: "" }
    ];

    setCandidatos(listaRecuperacao);

    // cria eleitor automático se não existir
    if (!storedVoter) {
      const fake = { nome: "Visitante", municipio: "Teste" };
      localStorage.setItem("currentVoter", JSON.stringify(fake));
      setVoter(fake);
    } else {
      setVoter(JSON.parse(storedVoter));
    }

  }, []);

  const handleVote = async () => {
    if (!selectedCandidate || !voter) return;

    setIsVoting(true);

    try {
      const candidate = candidatos.find(c => c.number === selectedCandidate);
      const votes = JSON.parse(localStorage.getItem("votes") || "[]");

      votes.push({
        candidateName: candidate?.name,
        candidateNumber: selectedCandidate,
        municipio: voter.municipio,
        timestamp: new Date().toISOString()
      });

      localStorage.setItem("votes", JSON.stringify(votes));

      playBallotSound();
      setShowConfirmation(true);

      setTimeout(() => {
        setLocation("/");
      }, 3000);

    } catch (error) {
      setIsVoting(false);
    }
  };

  if (!voter) {
    return (
      <Layout>
        <div className="flex justify-center mt-20">
          <Loader className="animate-spin" />
        </div>
      </Layout>
    );
  }

  if (showConfirmation) {
    return (
      <Layout>
        <div className="text-center mt-20">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold mt-4">Voto Confirmado!</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4">

        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">Urna Municipal</h1>
          <Button onClick={() => setLocation("/")} variant="outline">
            Voltar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {candidatos.map((c) => (
            <button
              key={c.number}
              onClick={() => setSelectedCandidate(c.number)}
              className={`p-6 rounded-xl border-2 ${
                selectedCandidate === c.number
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <p className="text-3xl font-bold text-blue-600">{c.number}</p>
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm text-gray-500">{c.party}</p>
            </button>
          ))}
        </div>

        <Button
          onClick={handleVote}
          disabled={!selectedCandidate || isVoting}
          className="w-full py-6 bg-green-600 hover:bg-green-700 text-white font-bold text-xl"
        >
          {isVoting ? "GRAVANDO..." : "CONFIRMAR VOTO"}
        </Button>

      </div>
    </Layout>
  );
}