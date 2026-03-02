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
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
].sort();

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(true);
  
  const [formData, setFormData] = useState({
    estado: "",
    municipio: "",
  });
  
  const [isSaving, setIsSaving] = useState(false);
  
  // Load current election config
  const { data: currentConfig } = trpc.admin.getElectionConfig.useQuery();
  const saveMutation = trpc.admin.saveElectionConfig.useMutation();
  
  // Load current config when available
  useEffect(() => {
    if (currentConfig) {
      setFormData({
        estado: currentConfig.state,
        municipio: currentConfig.municipality,
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
        description: "Por favor, preencha estado e município.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      await saveMutation.mutateAsync({
        state: formData.estado,
        municipality: formData.municipio,
        electionName: "",
        electionYear: new Date().getFullYear(),
      });
      
      toast({
        title: "✅ Configuração Salva",
        description: `Eleição configurada para ${formData.municipio}, ${formData.estado}`,
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
            <h2 className="text-3xl font-bold text-white">Configuração</h2>
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
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>

          {/* Município */}
          <div className="space-y-2">
            <Label htmlFor="municipio" className="text-gray-200">Município *</Label>
            <Input 
              id="municipio" 
              value={formData.municipio}
              onChange={(e) => setFormData(prev => ({ ...prev, municipio: e.target.value }))}
              placeholder="Digite o nome do município"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              required
            />
          </div>

          {/* Current Config Display */}
          {currentConfig && (
            <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-300 text-sm">
                <strong>Configuração Atual:</strong> {currentConfig.municipality}, {currentConfig.state}
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
                Gravar
              </>
            )}
          </Button>
        </form>
      </div>
    </Layout>
  );
}
