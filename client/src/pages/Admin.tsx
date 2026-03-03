import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { ArrowLeft, Lock, Settings, Save, Loader, Plus, Trash2, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";

// List of 27 Brazilian states
const ESTADOS_BRASIL = [
  { id: 12, nome: "Acre", sigla: "AC" },
  { id: 27, nome: "Alagoas", sigla: "AL" },
  { id: 16, nome: "Amapá", sigla: "AP" },
  { id: 13, nome: "Amazonas", sigla: "AM" },
  { id: 29, nome: "Bahia", sigla: "BA" },
  { id: 23, nome: "Ceará", sigla: "CE" },
  { id: 53, nome: "Distrito Federal", sigla: "DF" },
  { id: 32, nome: "Espírito Santo", sigla: "ES" },
  { id: 52, nome: "Goiás", sigla: "GO" },
  { id: 21, nome: "Maranhão", sigla: "MA" },
  { id: 51, nome: "Mato Grosso", sigla: "MT" },
  { id: 50, nome: "Mato Grosso do Sul", sigla: "MS" },
  { id: 31, nome: "Minas Gerais", sigla: "MG" },
  { id: 15, nome: "Pará", sigla: "PA" },
  { id: 25, nome: "Paraíba", sigla: "PB" },
  { id: 41, nome: "Paraná", sigla: "PR" },
  { id: 26, nome: "Pernambuco", sigla: "PE" },
  { id: 22, nome: "Piauí", sigla: "PI" },
  { id: 24, nome: "Rio Grande do Norte", sigla: "RN" },
  { id: 43, nome: "Rio Grande do Sul", sigla: "RS" },
  { id: 20, nome: "Rondônia", sigla: "RO" },
  { id: 14, nome: "Roraima", sigla: "RR" },
  { id: 42, nome: "Santa Catarina", sigla: "SC" },
  { id: 35, nome: "São Paulo", sigla: "SP" },
  { id: 28, nome: "Sergipe", sigla: "SE" },
  { id: 17, nome: "Tocantins", sigla: "TO" },
];

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(true);
  const [activeTab, setActiveTab] = useState<"config" | "candidates">("config");
  
  const [formData, setFormData] = useState({
    estado: "",
    municipio: "",
    electionName: "",
    electionYear: new Date().getFullYear(),
  });
  
  const [candidateForm, setCandidateForm] = useState({
    number: "",
    name: "",
    party: "",
    position: "",
  });
  
  const [municipios, setMunicipios] = useState<any[]>([]);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<any>(null);
  const [editForm, setEditForm] = useState({ number: "", name: "", party: "", position: "" });
  
  // Load current election config
  const { data: currentConfig } = trpc.admin.getElectionConfig.useQuery();
  const saveMutation = trpc.admin.saveElectionConfig.useMutation();
  
  // Candidate mutations
  const { data: candidates, refetch: refetchCandidates } = trpc.candidates.list.useQuery();
  const createCandidateMutation = trpc.candidates.create.useMutation();
  const deleteCandidateMutation = trpc.candidates.delete.useMutation();
  const updateCandidateMutation = trpc.candidates.update.useMutation();
  
  // Load municipalities when state changes
  useEffect(() => {
    if (!formData.estado) {
      setMunicipios([]);
      setFormData(prev => ({ ...prev, municipio: "" }));
      return;
    }

    const fetchMunicipios = async () => {
      setLoadingMunicipios(true);
      try {
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${formData.estado}/municipios?orderBy=nome`
        );
        const data = await response.json();
        setMunicipios(data);
        setFormData(prev => ({ ...prev, municipio: "" }));
      } catch (error) {
        console.error("Erro ao carregar municípios:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os municípios.",
          variant: "destructive"
        });
      } finally {
        setLoadingMunicipios(false);
      }
    };

    fetchMunicipios();
  }, [formData.estado]);
  
  // Load current config when available
  useEffect(() => {
    if (currentConfig) {
      setFormData({
        estado: currentConfig.state,
        municipio: currentConfig.municipality,
        electionName: currentConfig.electionName || "",
        electionYear: currentConfig.electionYear,
      });
      setIsAuthenticated(true);
      setShowPasswordForm(false);
    }
  }, [currentConfig]);
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple password check (in production, use proper authentication)
    if (adminPassword === "admin123") {
      setIsAuthenticated(true);
      setShowPasswordForm(false);
      toast({
        title: "Autenticado",
        description: "Bem-vindo ao painel de administrador!",
        className: "bg-green-600 text-white border-none"
      });
    } else {
      toast({
        title: "Erro",
        description: "Senha de administrador incorreta.",
        variant: "destructive"
      });
    }
  };
  
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.estado || !formData.municipio) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, selecione estado e município.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const estadoObj = ESTADOS_BRASIL.find(e => e.id.toString() === formData.estado);
      
      await saveMutation.mutateAsync({
        state: estadoObj?.sigla || "",
        municipality: formData.municipio,
        electionName: formData.electionName,
        electionYear: formData.electionYear,
      });
      
      toast({
        title: "✅ Configuração Salva",
        description: `Eleição configurada para ${formData.municipio}, ${estadoObj?.nome}`,
        className: "bg-green-600 text-white border-none"
      });
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar a configuração.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!candidateForm.number || !candidateForm.name) {
      toast({
        title: "Campos obrigatórios",
        description: "Número e nome do candidato são obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await createCandidateMutation.mutateAsync({
        number: parseInt(candidateForm.number),
        name: candidateForm.name,
        party: candidateForm.party || undefined,
        position: candidateForm.position || undefined,
      });
      
      setCandidateForm({ number: "", name: "", party: "", position: "" });
      refetchCandidates();
      
      toast({
        title: "✅ Candidato Adicionado",
        description: `${candidateForm.name} foi adicionado com sucesso!`,
        className: "bg-green-600 text-white border-none"
      });
    } catch (error: any) {
      console.error("Erro ao adicionar candidato:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar o candidato.",
        variant: "destructive"
      });
    }
  };

  const handleEditCandidate = (candidate: any) => {
    setEditingCandidate(candidate);
    setEditForm({
      number: candidate.number.toString(),
      name: candidate.name,
      party: candidate.party || "",
      position: candidate.position || ""
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCandidate) return;

    try {
      await updateCandidateMutation.mutateAsync({
        id: editingCandidate.id,
        data: {
          number: parseInt(editForm.number),
          name: editForm.name,
          party: editForm.party || undefined,
          position: editForm.position || undefined,
        }
      });
      
      setEditingCandidate(null);
      refetchCandidates();
      
      toast({
        title: "Candidato Atualizado",
        description: "Dados do candidato foram atualizados com sucesso!",
        className: "bg-green-600 text-white border-none"
      });
    } catch (error: any) {
      console.error("Erro ao atualizar candidato:", error);
      toast({
        title: "Erro",
        description: error.message || "Nao foi possivel atualizar o candidato.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCandidate = async (id: number) => {
    if (!confirm("Tem certeza que deseja remover este candidato?")) return;
    
    try {
      await deleteCandidateMutation.mutateAsync({ id });
      refetchCandidates();
      
      toast({
        title: "✅ Candidato Removido",
        description: "Candidato foi removido com sucesso!",
        className: "bg-green-600 text-white border-none"
      });
    } catch (error: any) {
      console.error("Erro ao remover candidato:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível remover o candidato.",
        variant: "destructive"
      });
    }
  };

  if (showPasswordForm) {
    return (
      <Layout>
        <div className="glass-panel rounded-3xl p-6 md:p-10 w-full max-w-md mx-auto animate-in slide-in-from-right duration-500">
          <div className="flex items-center justify-center mb-8">
            <Lock className="w-8 h-8 text-blue-400 mr-3" />
            <h2 className="text-3xl font-bold text-white">Painel de Admin</h2>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">Senha de Administrador</Label>
              <Input 
                id="password" 
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Digite a senha"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                required
              />
            </div>

            <Button 
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 rounded-lg"
            >
              Entrar
            </Button>
          </form>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="glass-panel rounded-3xl p-6 md:p-10 w-full max-w-4xl mx-auto animate-in slide-in-from-right duration-500">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" onClick={() => setLocation("/")} className="text-white hover:bg-white/10 gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-400" />
            <h2 className="text-3xl font-bold text-white">Painel de Admin</h2>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab("config")}
            className={`pb-3 px-4 font-semibold transition ${
              activeTab === "config"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Configuração
          </button>
          <button
            onClick={() => setActiveTab("candidates")}
            className={`pb-3 px-4 font-semibold transition ${
              activeTab === "candidates"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Candidatos
          </button>
        </div>

        {/* Config Tab */}
        {activeTab === "config" && (
          <form onSubmit={handleSaveConfig} className="space-y-6">
            
            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="estado" className="text-gray-200">Estado *</Label>
              <select
                id="estado"
                value={formData.estado}
                onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-white/40"
                required
              >
                <option value="">Selecione um estado</option>
                {ESTADOS_BRASIL.map(estado => (
                  <option key={estado.id} value={estado.id}>
                    {estado.nome} ({estado.sigla})
                  </option>
                ))}
              </select>
            </div>

            {/* Município */}
            <div className="space-y-2">
              <Label htmlFor="municipio" className="text-gray-200">Município * (Digite o nome)</Label>
              <Input 
                id="municipio" 
                value={formData.municipio}
                onChange={(e) => setFormData(prev => ({ ...prev, municipio: e.target.value }))}
                placeholder="Digite o nome do município"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                required
              />
            </div>

            {/* Election Name */}
            <div className="space-y-2">
              <Label htmlFor="electionName" className="text-gray-200">Nome da Eleição (Opcional)</Label>
              <Input 
                id="electionName" 
                value={formData.electionName}
                onChange={(e) => setFormData(prev => ({ ...prev, electionName: e.target.value }))}
                placeholder="Ex: Eleição Municipal 2024"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>

            {/* Election Year */}
            <div className="space-y-2">
              <Label htmlFor="electionYear" className="text-gray-200">Ano da Eleição *</Label>
              <Input 
                id="electionYear" 
                type="number"
                value={formData.electionYear}
                onChange={(e) => setFormData(prev => ({ ...prev, electionYear: parseInt(e.target.value) }))}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                required
              />
            </div>

            {/* Current Config Display */}
            {currentConfig && (
              <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-300 text-sm">
                  <strong>Configuração Atual:</strong> {currentConfig.municipality}, {currentConfig.state} ({currentConfig.electionYear})
                </p>
              </div>
            )}

            {/* Save Button */}
            <Button 
              type="submit" 
              disabled={isSaving || saveMutation.isPending}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-3 rounded-lg gap-2"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Configuração
                </>
              )}
            </Button>
          </form>
        )}

        {/* Candidates Tab */}
        {activeTab === "candidates" && (
          <div className="space-y-8">
            
            {/* Add Candidate Form */}
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-400" />
                Adicionar Novo Candidato
              </h3>
              
              <form onSubmit={handleAddCandidate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="number" className="text-gray-200">Número *</Label>
                  <Input 
                    id="number" 
                    type="number"
                    value={candidateForm.number}
                    onChange={(e) => setCandidateForm(prev => ({ ...prev, number: e.target.value }))}
                    placeholder="Ex: 10, 20, 11"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-200">Nome do Candidato *</Label>
                  <Input 
                    id="name" 
                    value={candidateForm.name}
                    onChange={(e) => setCandidateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome completo"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="party" className="text-gray-200">Partido (Opcional)</Label>
                  <Input 
                    id="party" 
                    value={candidateForm.party}
                    onChange={(e) => setCandidateForm(prev => ({ ...prev, party: e.target.value }))}
                    placeholder="Ex: PT, PSDB, PSD"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position" className="text-gray-200">Cargo (Opcional)</Label>
                  <Input 
                    id="position" 
                    value={candidateForm.position}
                    onChange={(e) => setCandidateForm(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="Ex: Vereador, Prefeito"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <Button 
                  type="submit"
                  disabled={createCandidateMutation.isPending}
                  className="md:col-span-2 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-2 rounded-lg gap-2"
                >
                  {createCandidateMutation.isPending ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Adicionando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Adicionar Candidato
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Candidates List */}
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Candidatos Cadastrados ({candidates?.length || 0})
              </h3>
              
              {candidates && candidates.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-white">
                    <thead className="border-b border-white/10">
                      <tr>
                        <th className="text-left py-3 px-4">Número</th>
                        <th className="text-left py-3 px-4">Nome</th>
                        <th className="text-left py-3 px-4">Partido</th>
                        <th className="text-left py-3 px-4">Cargo</th>
                        <th className="text-center py-3 px-4">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidates.map((candidate: any) => (
                        <tr key={candidate.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-4 font-semibold">{candidate.number}</td>
                          <td className="py-3 px-4">{candidate.name}</td>
                          <td className="py-3 px-4">{candidate.party || "-"}</td>
                          <td className="py-3 px-4">{candidate.position || "-"}</td>
                          <td className="py-3 px-4 text-center flex gap-2 justify-center">
                            <Button
                              onClick={() => handleEditCandidate(candidate)}
                              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 py-1 px-3 text-sm"
                            >
                              Editar
                            </Button>
                            <Button
                              onClick={() => handleDeleteCandidate(candidate.id)}
                              disabled={deleteCandidateMutation.isPending}
                              className="bg-red-600 hover:bg-red-700 text-white gap-2 py-1 px-3 text-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remover
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">Nenhum candidato cadastrado ainda.</p>
              )}
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingCandidate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full border border-white/10">
              <h3 className="text-white font-semibold mb-4 text-lg">Editar Candidato</h3>
              
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-number" className="text-gray-200">Numero</Label>
                  <Input 
                    id="edit-number" 
                    type="number"
                    value={editForm.number}
                    onChange={(e) => setEditForm(prev => ({ ...prev, number: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-gray-200">Nome</Label>
                  <Input 
                    id="edit-name" 
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-party" className="text-gray-200">Partido</Label>
                  <Input 
                    id="edit-party" 
                    value={editForm.party}
                    onChange={(e) => setEditForm(prev => ({ ...prev, party: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-position" className="text-gray-200">Cargo</Label>
                  <Input 
                    id="edit-position" 
                    value={editForm.position}
                    onChange={(e) => setEditForm(prev => ({ ...prev, position: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setEditingCandidate(null)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateCandidateMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {updateCandidateMutation.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
