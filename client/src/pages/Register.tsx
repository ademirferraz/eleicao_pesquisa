import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { ArrowLeft, LogOut, Loader, CheckCircle2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { isValidCPF, isValidDate, isValidVotingAge, calculateAge } from "@/utils/validation";

// Funções de formatação de input
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
import localidades from "@/../../server/localidades.json";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const registerMutation = trpc.voters.register.useMutation();
  
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    birthDate: "",
    bairro: ""
  });

  // Validation states
  const [validation, setValidation] = useState({
    cpf: { isValid: false, isTouched: false },
    birthDate: { isValid: false, isTouched: false, age: -1 }
  });

  const [bairros, setBairros] = useState<string[]>([]);
  const [electionConfig, setElectionConfig] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load election config and neighborhoods
  const { data: config } = trpc.admin.getElectionConfig.useQuery();
  
  useEffect(() => {
    if (config) {
      setElectionConfig(config);
      
      // Load neighborhoods from localidades dataset
      const loc = localidades as any;
      if (loc[config.state] && loc[config.state].municipios[config.municipality]) {
        const municipioData = loc[config.state].municipios[config.municipality];
        const allNeighborhoods = [
          ...municipioData.bairros,
          ...municipioData.distritos
        ].sort();
        setBairros(allNeighborhoods);
      } else {
        // Fallback if not found in dataset
        setBairros(["Centro", "Zona Rural", "Distritos", "Outros"]);
      }
    }
  }, [config]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData(prev => ({ ...prev, cpf: formatted }));
    
    // Validate CPF
    if (formatted.length === 14) {
      const isValid = isValidCPF(formatted);
      setValidation(prev => ({
        ...prev,
        cpf: { isValid, isTouched: true }
      }));
    } else if (formatted.length > 0) {
      setValidation(prev => ({
        ...prev,
        cpf: { isValid: false, isTouched: true }
      }));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDate(e.target.value);
    setFormData(prev => ({ ...prev, birthDate: formatted }));
    
    // Validate date
    if (formatted.length === 10) {
      const isValid = isValidDate(formatted);
      const age = calculateAge(formatted);
      const isValidAge = isValidVotingAge(formatted);
      setValidation(prev => ({
        ...prev,
        birthDate: { isValid: isValid && isValidAge, isTouched: true, age }
      }));
    } else if (formatted.length > 0) {
      setValidation(prev => ({
        ...prev,
        birthDate: { isValid: false, isTouched: true, age: -1 }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name || !formData.cpf || !formData.birthDate || !formData.bairro) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    // Validação de CPF
    if (!validation.cpf.isValid) {
      toast({
        title: "CPF inválido",
        description: "Por favor, insira um CPF válido.",
        variant: "destructive"
      });
      return;
    }

    // Validação de Data
    if (!validation.birthDate.isValid) {
      toast({
        title: "Data ou idade inválida",
        description: "Por favor, insira uma data válida. Você deve ter pelo menos 16 anos.",
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
      const cpfDigits = formData.cpf.replace(/\D/g, "");
      const voterDataForDB = {
        cpf: cpfDigits,
        name: formData.name,
        birthDate: formData.birthDate,
        state: electionConfig.state,
        municipality: electionConfig.municipality,
        neighborhood: formData.bairro
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
        bairro: formData.bairro,
        age: validation.birthDate.age
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

  if (!electionConfig) {
    return (
      <Layout>
        <div className="glass-panel rounded-3xl p-6 md:p-10 w-full max-w-md mx-auto animate-in slide-in-from-right duration-500">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-white">Carregando configuração de eleição...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="glass-panel rounded-3xl p-6 md:p-10 w-full max-w-3xl mx-auto animate-in slide-in-from-right duration-500">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" onClick={() => setLocation("/")} className="text-white hover:bg-white/10 gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          <Button variant="destructive" onClick={() => setLocation("/")} className="gap-2 bg-red-500/80 hover:bg-red-600">
            <LogOut className="w-4 h-4" /> Sair do App
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
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Digite seu nome completo"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              required
            />
          </div>

          {/* CPF */}
          <div className="space-y-2">
            <Label htmlFor="cpf" className="text-gray-200">CPF *</Label>
            <div className="relative">
              <Input 
                id="cpf" 
                name="cpf"
                value={formData.cpf}
                onChange={handleCPFChange}
                placeholder="000.000.000-00"
                maxLength={14}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-12"
                required
              />
              {validation.cpf.isTouched && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {validation.cpf.isValid ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
              )}
            </div>
            {validation.cpf.isTouched && !validation.cpf.isValid && formData.cpf.length === 14 && (
              <p className="text-red-400 text-sm">CPF inválido. Verifique os dígitos.</p>
            )}
          </div>

          {/* Data de Nascimento */}
          <div className="space-y-2">
            <Label htmlFor="birthDate" className="text-gray-200">Data de Nascimento *</Label>
            <div className="relative">
              <Input 
                id="birthDate" 
                name="birthDate"
                value={formData.birthDate}
                onChange={handleDateChange}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-12"
                required
              />
              {validation.birthDate.isTouched && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {validation.birthDate.isValid ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
              )}
            </div>
            {validation.birthDate.isTouched && (
              <>
                {!validation.birthDate.isValid && formData.birthDate.length === 10 && (
                  <p className="text-red-400 text-sm">
                    {validation.birthDate.age >= 0 && validation.birthDate.age < 16
                      ? `Você tem ${validation.birthDate.age} anos. A idade mínima é 16 anos.`
                      : "Data inválida. Verifique o formato DD/MM/AAAA."}
                  </p>
                )}
                {validation.birthDate.isValid && validation.birthDate.age >= 0 && (
                  <p className="text-green-400 text-sm">✓ {validation.birthDate.age} anos - Elegível para votar</p>
                )}
              </>
            )}
          </div>

          {/* Bairro */}
          <div className="space-y-2">
            <Label htmlFor="bairro" className="text-gray-200">Bairro/Região *</Label>
            <select
              id="bairro"
              value={formData.bairro}
              onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
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

          {/* Botões */}
          <div className="flex gap-4 pt-6">
            <Button 
              type="submit" 
              disabled={isSubmitting || registerMutation.isPending || !validation.cpf.isValid || !validation.birthDate.isValid}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-3 rounded-lg gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        </form>
      </div>
    </Layout>
  );
}
