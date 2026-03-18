import { gerarVotosTeste } from "@/utils/geradorVotos";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { 
  ArrowLeft, LogOut, Trash2, Save, FileBarChart, 
  Users, Edit, Plus, X 
} from "lucide-react";

// Componente Modal para Edição/Inclusão com upload de foto
const CandidateModal = ({ isOpen, onClose, onSave, candidate, count }: any) => {
  const [name, setName] = useState(candidate?.name || "");
  const [number, setNumber] = useState(candidate?.number?.toString() || "");
  const [photo, setPhoto] = useState(candidate?.photo || "");

  const handlePhotoChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-4">
          {candidate ? "Editar Candidato" : `Incluir Novo (${count}/10)`}
        </h3>
        <div className="space-y-4">
          <Input 
            placeholder="Nome do Candidato" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="bg-white/5 text-white"
             <button onClick={gerarVotosTeste}
        style={{padding:20,
    background:"green",
    color:"white",
    fontSize:18
  }}
>
GERAR 100 VOTOS TESTE
</button>
          />
          <Input 
            placeholder="Número (Ex: 10)" 
            type="number"
            value={number} 
            onChange={(e) => setNumber(e.target.value)}
            className="bg-white/5 text-white"
          />
          <div>
            <label className="text-gray-300 text-sm">Foto do Candidato</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full mt-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
            />
            {photo && (
              <div className="mt-3">
                <img src={photo} alt="Preview" className="w-24 h-24 rounded-lg object-cover" />
              </div>
            )}
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} variant="ghost" className="flex-1 text-white">Cancelar</Button>
            <Button onClick={() => onSave({ number: parseInt(number), name, photo })} className="flex-1 bg-blue-600 hover:bg-blue-500">
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
  const [municipio, setMunicipioLocal] = useState(localStorage.getItem("municipio_admin") || "");
  const [estado, setEstadoLocal] = useState(localStorage.getItem("estado_admin") || "");
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<any>(null);

  // Lista de 27 estados brasileiros
  const ESTADOS_BRASIL = [
    { id: "AC", nome: "Acre" },
    { id: "AL", nome: "Alagoas" },
    { id: "AP", nome: "Amapá" },
    { id: "AM", nome: "Amazonas" },
    { id: "BA", nome: "Bahia" },
    { id: "CE", nome: "Ceará" },
    { id: "DF", nome: "Distrito Federal" },
    { id: "ES", nome: "Espírito Santo" },
    { id: "GO", nome: "Goiás" },
    { id: "MA", nome: "Maranhão" },
    { id: "MT", nome: "Mato Grosso" },
    { id: "MS", nome: "Mato Grosso do Sul" },
    { id: "MG", nome: "Minas Gerais" },
    { id: "PA", nome: "Pará" },
    { id: "PB", nome: "Paraíba" },
    { id: "PR", nome: "Paraná" },
    { id: "PE", nome: "Pernambuco" },
    { id: "PI", nome: "Piauí" },
    { id: "RJ", nome: "Rio de Janeiro" },
    { id: "RN", nome: "Rio Grande do Norte" },
    { id: "RS", nome: "Rio Grande do Sul" },
    { id: "RO", nome: "Rondônia" },
    { id: "RR", nome: "Roraima" },
    { id: "SC", nome: "Santa Catarina" },
    { id: "SP", nome: "São Paulo" },
    { id: "SE", nome: "Sergipe" },
    { id: "TO", nome: "Tocantins" },
  ];

  useEffect(() => {
    const votes = JSON.parse(localStorage.getItem("votes") || "[]");
    const savedCands = JSON.parse(localStorage.getItem("candidatos") || "[]");
    
    setCandidatos(savedCands);
    setStats({ totalVotes: votes.length });
  }, []);

  const saveCandidatos = (list: any[]) => {
    localStorage.setItem("candidatos", JSON.stringify(list));
    setCandidatos(list);
  };

  const handleSaveCandidate = (data: any) => {
    if (!data.name || !data.number) {
      return toast({ 
        title: "Erro", 
        description: "Preencha nome e número!", 
        variant: "destructive" 
      });
    }
    
    if (candidatos.length >= 10 && !editingCandidate) {
      return toast({ 
        title: "Limite atingido", 
        description: "Máximo de 10 candidatos permitido.", 
        variant: "destructive" 
      });
    }

    let newList;
    if (editingCandidate) {
      newList = candidatos.map(c => c.number === editingCandidate.number ? data : c);
    } else {
      newList = [...candidatos, data];
    }
    
    saveCandidatos(newList);
    setIsModalOpen(false);
    setEditingCandidate(null);
    toast({ 
      title: "Sucesso", 
      description: "Candidato salvo com sucesso!",
      className: "bg-green-600 text-white border-none"
    });
  };

  const handleDeleteCandidate = (number: number) => {
    if (confirm("Deseja remover este candidato?")) {
      const newList = candidatos.filter(c => c.number !== number);
      saveCandidatos(newList);
      toast({ 
        title: "Removido", 
        description: "Candidato removido com sucesso!",
        className: "bg-green-600 text-white border-none"
      });
    }
  };

  const handleExcluirTudo = () => {
    if (confirm("Deseja apagar TODOS os candidatos E VOTOS?")) {
      localStorage.removeItem("candidatos");
      localStorage.removeItem("votes");
      setCandidatos([]);
      setStats({ totalVotes: 0 });
      toast({ 
        title: "Limpo", 
        description: "Lista de candidatos e votos zerada.", 
        variant: "destructive" 
      });
    }
  };

  const handleSaveConfig = () => {
    if (!estado || !municipio) {
      return toast({
        title: "Erro",
        description: "Selecione estado e digite o município!",
        variant: "destructive"
      });
    }
    localStorage.setItem("estado_admin", estado);
    localStorage.setItem("municipio_admin", municipio);
    toast({
      title: "Configuração Salva",
      description: `${estado} - ${municipio}`,
      className: "bg-green-600 text-white border-none"
    });
  };

  return (
    <Layout>
      <div className="glass-panel rounded-3xl p-8 w-full max-w-4xl mx-auto animate-in fade-in">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/10 pb-6">
          <h2 className="text-2xl font-bold text-white">Painel Administrativo</h2>
          <Button variant="destructive" onClick={() => setLocation("/")}><LogOut className="w-4 h-4" /></Button>
        </div>

        {/* Configuração de Estado e Município */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-8">
          <h3 className="text-white font-bold mb-4">Configuração da Eleição</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-gray-300 text-sm">Estado</label>
              <select 
                value={estado}
                onChange={(e) => setEstadoLocal(e.target.value)}
                className="w-full mt-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
              >
                <option value="">Selecione um estado</option>
                {ESTADOS_BRASIL.map(est => (
                  <option key={est.id} value={est.id}>{est.nome} ({est.id})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-300 text-sm">Município</label>
              <Input 
                placeholder="Digite o município" 
                value={municipio}
                onChange={(e) => setMunicipioLocal(e.target.value)}
                className="bg-white/10 text-white mt-2"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSaveConfig} className="w-full bg-blue-600 hover:bg-blue-500">
                <Save className="w-4 h-4 mr-2" /> Salvar
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 p-6 rounded-xl border border-white/10 text-center">
            <p className="text-gray-400 text-sm">VOTOS</p>
            <p className="text-4xl font-bold text-white">{stats.totalVotes}</p>
          </div>
          <div className="bg-white/5 p-6 rounded-xl border border-white/10 text-center">
            <p className="text-gray-400 text-sm">CANDIDATOS</p>
            <p className="text-4xl font-bold text-white">{candidatos.length}/10</p>
          </div>
        </div>

        {/* Gestão de Candidatos */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold flex items-center gap-2"><Users className="w-5 h-5"/> Candidatos</h3>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { setEditingCandidate(null); setIsModalOpen(true); }} className="bg-blue-600">
                <Plus className="w-4 h-4 mr-1"/> Incluir
              </Button>
              <Button size="sm" variant="outline" onClick={handleExcluirTudo} className="border-red-500 text-red-500 hover:bg-red-500/10">
                <Trash2 className="w-4 h-4"/>
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {candidatos.map((c) => (
              <div key={c.number} className="flex justify-between items-center p-3 bg-black/20 rounded-lg border border-white/5">
                <div className="flex items-center gap-3 flex-1">
                  {c.photo && (
                    <img src={c.photo} alt={c.name} className="w-10 h-10 rounded object-cover" />
                  )}
                  <div>
                    <p className="text-white font-medium">{c.number} - {c.name}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => { setEditingCandidate(c); setIsModalOpen(true); }}>
                    <Edit className="w-4 h-4 text-gray-400" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDeleteCandidate(c.number)}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
            {candidatos.length === 0 && <p className="text-gray-500 text-sm col-span-2">Nenhum candidato cadastrado.</p>}
          </div>
        </div>

        {/* Botões de Ação Final */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <Button onClick={() => setLocation("/results")} className="h-12 bg-purple-600 hover:bg-purple-500">
             <FileBarChart className="mr-2 w-5 h-5" /> Resultados
           </Button>
           <Button variant="outline" onClick={() => { localStorage.removeItem("votes"); window.location.reload(); }} className="h-12 border-red-500/50 text-red-400">
             Zerar Votação (Manter Candidatos)
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
