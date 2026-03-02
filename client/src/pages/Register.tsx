import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { ArrowLeft, LogOut, Loader } from "lucide-react";
import { trpc } from "@/lib/trpc";

// Funções de formatação
const formatCPF = (value: string): string => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
};

const formatDate = (value: string): string => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
};

// Import localidades dataset
const localidades = require("@/../../server/localidades.json");

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const registerMutation = trpc.voters.register.useMutation();
  
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    birthDate: "",
    neighborhood: ""
  });

  const [bairros, setBairros] = useState<string[]>([]);
  const [electionConfig, setElectionConfig] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load election config and neighborhoods
  const { data: config, isLoading } = trpc.admin.getElectionConfig.useQuery();
  
  useEffect(() => {
    if (config) {
      setElectionConfig(config);
      
      // Load neighborhoods from localidades dataset
      try {
        const loc = localidades as any;
        if (loc[config.state] && loc[config.state].municipios[config.municipality]) {
          const municipioData = loc[config.state].municipios[config.municipality];
          const allNeighborhoods = [
            ...municipioData.bairros,
            ...municipioData.distritos
          ].sort();
          setBairros(allNeighborhoods);
        } else {
          // Fallback if not found
          setBairros(["Centro", "Zona Rural", "Outros"]);
        }
      } catch (error) {
        console.error("Erro ao carregar bairros:", error);
        setBairros(["Centro", "Zona Rural", "Outros"]);
      }
    }
  }, [config]);

  const validateAge = (dateString: string) => {
    const parts = dateString.split('/');
    if (parts.length !== 3) return -1;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > new Date().getFullYear()) {
      return -1;
    }
    
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name || !formData.cpf || !formData.birthDate || !formData.neighborhood) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    // Validação de CPF
    const cpfDigits = formData.cpf.replace(/\D/g, "");
    if (cpfDigits.length !== 11) {
      toast({
        title: "CPF inválido",
        description: "O CPF deve conter 11 dígitos.",
        variant: "destructive"
      });
      return;
    }

    // Validação de Idade
    const age = validateAge(formData.birthDate);
    if (age < 0) {
      toast({
        title: "Data inválida",
        description: "Por favor, insira uma data válida no formato DD/MM/AAAA.",
        variant: "destructive"
      });
      return;
    }

    if (age < 16) {
      toast({
        title: "Você não pode votar",
        description: `Você tem ${age} anos. A idade mínima é 16 anos.`,
        variant: "destructive"
      });
      return;
    }

    if (!electionConfig) {
      toast({
        title: "Erro",
        description: "Configuração de eleição não encontrada. Contate o administrador.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar dados para registro
      const voterDataForDB = {
        cpf: cpfDigits,
        name: formData.name,
        birthDate: formData.birthDate,
        state: electionConfig.state,
        municipality: electionConfig.municipality,
        neighborhood: formData.neighborhood
      };

      // Registrar eleitor no banco de dados
      await registerMutation.mutateAsync(voterDataForDB);

      // Salvar dados temporariamente para exibição
      const voterDisplay = {
        name: formData.name,
        cpf: cpfDigits,
        birthDate: formData.birthDate,
        estado: electionConfig.state,
        municipio: electionConfig.municipality,
        bairro: formData.neighborhood,
        age
      };
      localStorage.setItem("currentVoter", JSON.stringify(voterDisplay));
      
      toast({
        title: "Cadastro realizado!",
        description: "Redirecionando para a votação...",
        className: "bg-green-600 text-white border-none"
      });

      setTimeout(() => setLocation("/votacao"), 1000);
    } catch (error: any) {
      console.error("Erro ao registrar:", error);
      toast({
        title: "Erro ao registrar",
        description: error.message || "Não foi possível completar o cadastro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="glass-panel rounded-3xl p-6 md:p-10 w-full max-w-md mx-auto animate-in slide-in-from-right duration-500">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-white">Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!electionConfig) {
    return (
      <Layout>
        <div className="glass-panel rounded-3xl p-6 md:p-10 w-full max-w-md mx-auto animate-in slide-in-from-right duration-500">
          <div className="text-center">
            <p className="text-red-400 mb-4">⚠️ Eleição não configurada</p>
            <p className="text-gray-300 text-sm">O administrador precisa configurar o estado e município antes de iniciar os cadastros.</p>
          </div>
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
          <Button variant="destructive" onClick={() => setLocation("/")} className="gap-2 bg-red-500/80 hover:bg-red-600">
            <LogOut className="w-4 h-4" /> Sair
          </Button>
        </div>

        <h2 className="text-3xl font-bold text-white mb-2 text-center">Cadastro de Eleitor</h2>
        <p className="text-gray-300 text-center mb-8">
          {electionConfig.municipality}, {electionConfig.state}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Nome Completo */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-200">Nome Completo *</Label>
            <Input 
              id="name" 
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite seu nome completo"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              required
            />
          </div>

          {/* CPF */}
          <div className="space-y-2">
            <Label htmlFor="cpf" className="text-gray-200">CPF *</Label>
            <Input 
              id="cpf" 
              value={formData.cpf}
              onChange={(e) => setFormData(prev => ({ ...prev, cpf: formatCPF(e.target.value) }))}
              placeholder="000.000.000-00"
              maxLength={14}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              required
            />
          </div>

          {/* Data de Nascimento */}
          <div className="space-y-2">
            <Label htmlFor="birthDate" className="text-gray-200">Data de Nascimento *</Label>
            <Input 
              id="birthDate" 
              value={formData.birthDate}
              onChange={(e) => setFormData(prev => ({ ...prev, birthDate: formatDate(e.target.value) }))}
              placeholder="DD/MM/AAAA"
              maxLength={10}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              required
            />
          </div>

          {/* Bairro */}
          <div className="space-y-2">
            <Label htmlFor="neighborhood" className="text-gray-200">Bairro *</Label>
            <select
              id="neighborhood"
              value={formData.neighborhood}
              onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-white/40"
              required
            >
              <option value="">Selecione um bairro</option>
              {bairros.map(bairro => (
                <option key={bairro} value={bairro}>
                  {bairro}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isSubmitting || registerMutation.isPending}
            className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-3 rounded-lg gap-2"
          >
            {registerMutation.isPending ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Processando...
              </>
            ) : (
              "Confirmar Cadastro"
            )}
          </Button>
        </form>
      </div>
    </Layout>
  );
}
