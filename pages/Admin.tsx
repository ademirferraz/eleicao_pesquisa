import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import {
  LogOut,
  Trash2,
  Save,
  FileBarChart,
  Users,
  Edit,
  Plus
} from "lucide-react";

const CandidateModal = ({ isOpen, onClose, onSave, candidate, count }: any) => {
  const [name, setName] = useState(candidate?.name || "");
  const [number, setNumber] = useState(candidate?.number?.toString() || "");
  const [photo, setPhoto] = useState(candidate?.photo || "");

  useEffect(() => {
    setName(candidate?.name || "");
    setNumber(candidate?.number?.toString() || "");
    setPhoto(candidate?.photo || "");
  }, [candidate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl w-full max-w-md">
        <h3 className="text-xl font-bold text-white mb-4">
          {candidate ? "Editar Candidato" : `Incluir Novo (${count}/10)`}
        </h3>

        <div className="space-y-4">
          <Input
            placeholder="Nome do candidato"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            placeholder="Número"
            type="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />

          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} variant="ghost" className="flex-1">
              Cancelar
            </Button>

            <Button
              onClick={() =>
                onSave({ number: parseInt(number), name, photo })
              }
              className="flex-1 bg-blue-600"
            >
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [stats, setStats] = useState({ totalVotes: 0 });
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<any>(null);

  useEffect(() => {
    const votes = JSON.parse(localStorage.getItem("votes") || "[]");
    const saved = JSON.parse(localStorage.getItem("candidatos") || "[]");
    setCandidatos(saved);
    setStats({ totalVotes: votes.length });
  }, []);

  const saveCandidatos = (list: any[]) => {
    localStorage.setItem("candidatos", JSON.stringify(list));
    setCandidatos(list);
  };

  const handleSaveCandidate = (data: any) => {
    if (!data.name || !data.number) {
      toast({
        title: "Erro",
        description: "Informe nome e número",
        variant: "destructive"
      });
      return;
    }

    let newList;

    if (editingCandidate) {
      newList = candidatos.map((c) =>
        c.number === editingCandidate.number ? data : c
      );
    } else {
      if (candidatos.length >= 10) {
        toast({
          title: "Limite",
          description: "Máximo de 10 candidatos",
          variant: "destructive"
        });
        return;
      }
      newList = [...candidatos, data];
    }

    saveCandidatos(newList);
    setIsModalOpen(false);
    setEditingCandidate(null);
  };

  const handleDeleteCandidate = (number: number) => {
    const newList = candidatos.filter((c) => c.number !== number);
    saveCandidatos(newList);
  };

  const zerarVotos = () => {
    localStorage.removeItem("votes");
    setStats({ totalVotes: 0 });
  };

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">

        <div className="flex justify-between mb-6">
          <h2 className="text-2xl text-white font-bold">
            Painel Administrativo
          </h2>

          <Button variant="destructive" onClick={() => setLocation("/")}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-black/30 p-6 rounded text-center">
            <p className="text-gray-400">Votos</p>
            <p className="text-4xl text-white">{stats.totalVotes}</p>
          </div>

          <div className="bg-black/30 p-6 rounded text-center">
            <p className="text-gray-400">Candidatos</p>
            <p className="text-4xl text-white">{candidatos.length}/10</p>
          </div>
        </div>

        <div className="bg-black/20 p-6 rounded mb-8">
          <div className="flex justify-between mb-4">
            <h3 className="text-white flex gap-2 items-center">
              <Users className="w-5 h-5" />
              Candidatos
            </h3>

            <Button
              size="sm"
              onClick={() => {
                setEditingCandidate(null);
                setIsModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Incluir
            </Button>
          </div>

          {candidatos.map((c) => (
            <div
              key={c.number}
              className="flex justify-between bg-black/30 p-3 mb-2 rounded"
            >
              <p className="text-white">
                {c.number} - {c.name}
              </p>

              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEditingCandidate(c);
                    setIsModalOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDeleteCandidate(c.number)}
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => setLocation("/results")}
            className="bg-purple-600"
          >
            <FileBarChart className="mr-2 w-5 h-5" />
            Resultados
          </Button>

          <Button
            variant="outline"
            onClick={zerarVotos}
            className="border-red-500 text-red-400"
          >
            Zerar Votação
          </Button>
        </div>

        <CandidateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCandidate}
          candidate={editingCandidate}
          count={candidatos.length}
        />

      </div>
    </Layout>
  );
}