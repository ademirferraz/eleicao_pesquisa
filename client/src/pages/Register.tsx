import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { ArrowLeft, LogOut, Loader } from "lucide-react";
import { trpc } from "@/lib/trpc";

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

interface Estado {
  id: number;
  nome: string;
  sigla: string;
}

interface Municipio {
  id: number;
  nome: string;
}

interface Bairro {
  nome: string;
}

// Lista de 27 estados do Brasil
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

// Bairros padrão para cidades não mapeadas
const BAIRROS_PADRAO = ["Centro", "Zona Rural", "Distritos", "Outros"];

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const registerMutation = trpc.voters.register.useMutation();
  
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    birthDate: "",
    estado: "",
    municipio: "",
    bairro: ""
  });

  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [bairros, setBairros] = useState<string[]>([]);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);
  const [loadingBairros, setLoadingBairros] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carregar municípios quando estado muda
  useEffect(() => {
    if (!formData.estado) {
      setMunicipios([]);
      setBairros([]);
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
        setFormData(prev => ({ ...prev, municipio: "", bairro: "" }));
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

  // Carregar bairros quando município muda (via API IBGE)
  useEffect(() => {
    if (!formData.municipio) {
      setBairros([]);
      setFormData(prev => ({ ...prev, bairro: "" }));
      return;
    }

    const fetchBairros = async () => {
      setLoadingBairros(true);
      try {
        // Tentar obter bairros via API IBGE
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${formData.municipio}/distritos?orderBy=nome`
        );
        
        if (!response.ok) throw new Error("Não encontrado");
        
        const data = await response.json();
        const bairrosList = data.map((d: any) => d.nome);
        
        if (bairrosList.length > 0) {
          setBairros(bairrosList);
        } else {
          // Fallback para bairros padrão
          setBairros(BAIRROS_PADRAO);
        }
      } catch (error) {
        // Se API falhar, usar bairros padrão
        console.warn("Usando bairros padrão:", error);
        setBairros(BAIRROS_PADRAO);
      } finally {
        setLoadingBairros(false);
      }
    };

    fetchBairros();
  }, [formData.municipio]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData(prev => ({ ...prev, cpf: formatted }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDate(e.target.value);
    setFormData(prev => ({ ...prev, birthDate: formatted }));
  };

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
    if (!formData.name || !formData.cpf || !formData.birthDate || !formData.estado || !formData.municipio || !formData.bairro) {
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

    setIsSubmitting(true);

    try {
      // Encontrar nomes de estado e município
      const estadoObj = ESTADOS_BRASIL.find(e => e.id.toString() === formData.estado);
      const municipioObj = municipios.find(m => m.id.toString() === formData.municipio);

      // Preparar dados para registro (com nomes corretos para tRPC)
      const voterDataForDB = {
        cpf: cpfDigits,
        name: formData.name,
        birthDate: formData.birthDate,
        state: estadoObj?.sigla || "",
        municipality: municipioObj?.nome || formData.municipio,
        neighborhood: formData.bairro
      };

      // Registrar eleitor no banco de dados
      await registerMutation.mutateAsync(voterDataForDB);

      // Salvar dados temporariamente para exibição
      const voterDisplay = {
        name: formData.name,
        cpf: cpfDigits,
        birthDate: formData.birthDate,
        estado: estadoObj?.nome || formData.estado,
        estadoSigla: estadoObj?.sigla || "",
        municipio: municipioObj?.nome || formData.municipio,
        bairro: formData.bairro,
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

        <h2 className="text-3xl font-bold text-white mb-6 text-center">Cadastro de Eleitor</h2>

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
            <Input 
              id="cpf" 
              name="cpf"
              value={formData.cpf}
              onChange={handleCPFChange}
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
              name="birthDate"
              value={formData.birthDate}
              onChange={handleDateChange}
              placeholder="DD/MM/AAAA"
              maxLength={10}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              required
            />
          </div>

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
                  {estado.nome}
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
                <option key={municipio.id} value={municipio.id}>
                  {municipio.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Bairro */}
          <div className="space-y-2">
            <Label htmlFor="bairro" className="text-gray-200">Bairro/Região *</Label>
            <select
              id="bairro"
              value={formData.bairro}
              onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
              disabled={!formData.municipio || loadingBairros}
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-white/40 disabled:opacity-50"
              required
            >
              <option value="">
                {loadingBairros ? "Carregando..." : "Selecione um bairro"}
              </option>
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
              disabled={isSubmitting || registerMutation.isPending}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-3 rounded-lg gap-2"
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
