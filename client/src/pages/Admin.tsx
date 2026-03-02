import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { ArrowLeft, Lock, Settings, Save, Loader } from "lucide-react";
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
  
  const [formData, setFormData] = useState({
    estado: "",
    municipio: "",
    electionName: "",
    electionYear: new Date().getFullYear(),
  });
  
  const [municipios, setMunicipios] = useState<any[]>([]);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Load current election config
  const { data: currentConfig } = trpc.admin.getElectionConfig.useQuery();
  const saveMutation = trpc.admin.saveElectionConfig.useMutation();
  
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
      <div className="glass-panel rounded-3xl p-6 md:p-10 w-full max-w-2xl mx-auto animate-in slide-in-from-right duration-500">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" onClick={() => setLocation("/")} className="text-white hover:bg-white/10 gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-400" />
            <h2 className="text-3xl font-bold text-white">Configuração de Eleição</h2>
          </div>
        </div>

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
            <Label htmlFor="municipio" className="text-gray-200">Município *</Label>
            <select
              id="municipio"
              value={formData.municipio}
              onChange={(e) => setFormData(prev => ({ ...prev, municipio: e.target.value }))}
              disabled={!formData.estado || loadingMunicipios}
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-white/40 disabled:opacity-50"
              required
            >
              <option value="">
                {loadingMunicipios ? "Carregando..." : "Selecione um município"}
              </option>
              {municipios.map(municipio => (
                <option key={municipio.id} value={municipio.nome}>
                  {municipio.nome}
                </option>
              ))}
            </select>
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
      </div>
    </Layout>
  );
}
