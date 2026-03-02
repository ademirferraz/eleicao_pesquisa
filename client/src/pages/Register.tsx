import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { ArrowLeft, LogOut, Loader } from "lucide-react";
import { getBairrosPorMunicipio } from "@/lib/bairros";

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

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    birthDate: "",
    estado: "",
    municipio: "",
    bairro: ""
  });

  const [estados, setEstados] = useState<Estado[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [bairros, setBairros] = useState<string[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(true);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);

  // Carregar estados do IBGE
  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const response = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome");
        const data = await response.json();
        setEstados(data);
      } catch (error) {
        console.error("Erro ao carregar estados:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os estados. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setLoadingEstados(false);
      }
    };

    fetchEstados();
  }, []);

  // Carregar municípios quando estado muda
  useEffect(() => {
    if (!formData.estado) {
      setMunicipios([]);
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
        setFormData(prev => ({ ...prev, municipio: "" })); // Limpar município quando estado muda
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

  // Carregar bairros quando município muda
  useEffect(() => {
    if (!formData.municipio) {
      setBairros([]);
      setFormData(prev => ({ ...prev, bairro: "" }));
      return;
    }

    // Obter bairros da lista local
    const bairrosDoMunicipio = getBairrosPorMunicipio(formData.municipio);
    setBairros(bairrosDoMunicipio);
    setFormData(prev => ({ ...prev, bairro: "" })); // Limpar bairro quando município muda
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
    
    // Validação básica de data
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name || !formData.cpf || !formData.birthDate || !formData.estado || !formData.municipio || !formData.bairro) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos incluindo o bairro.",
        variant: "destructive"
      });
      return;
    }

    // Validação de CPF (deve ter 11 dígitos)
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

    // Encontrar nomes de estado e município
    const estadoNome = estados.find(e => e.id.toString() === formData.estado)?.nome || formData.estado;
    const municipioNome = municipios.find(m => m.id.toString() === formData.municipio)?.nome || formData.municipio;

    // Salvar dados temporariamente (simulação)
    const voterData = {
      ...formData,
      estadoNome,
      municipioNome,
      age
    };
    localStorage.setItem("currentVoter", JSON.stringify(voterData));
    
    toast({
      title: "Cadastro realizado!",
      description: "Redirecionando para a votação...",
      className: "bg-green-600 text-white border-none"
    });

    setTimeout(() => setLocation("/votacao"), 1000);
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
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-200">Nome Completo *</Label>
            <Input 
              id="name" 
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Digite seu nome completo" 
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="cpf" className="text-gray-200">CPF *</Label>
              <Input 
                id="cpf" 
                name="cpf"
                value={formData.cpf}
                onChange={handleCPFChange}
                placeholder="XXX.XXX.XXX-XX" 
                maxLength={14}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate" className="text-gray-200">Data de Nascimento *</Label>
              <Input 
                id="birthDate" 
                name="birthDate"
                value={formData.birthDate}
                onChange={handleDateChange}
                placeholder="DD/MM/AAAA" 
                maxLength={10}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="estado" className="text-gray-200">Estado *</Label>
              <select
                id="estado"
                value={formData.estado}
                onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
                className="w-full bg-slate-900 border border-white/20 text-white placeholder:text-gray-400 h-12 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                style={{
                  backgroundColor: "#0f172a",
                  color: "#ffffff"
                }}
                disabled={loadingEstados}
                required
              >
                <option value="" style={{ backgroundColor: "#0f172a", color: "#ffffff" }}>
                  {loadingEstados ? "Carregando..." : "Selecione um Estado"}
                </option>
                {estados.map(estado => (
                  <option key={estado.id} value={estado.id} style={{ backgroundColor: "#0f172a", color: "#ffffff" }}>
                    {estado.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="municipio" className="text-gray-200">Município *</Label>
              <select
                id="municipio"
                value={formData.municipio}
                onChange={(e) => setFormData(prev => ({ ...prev, municipio: e.target.value }))}
                className="w-full bg-slate-900 border border-white/20 text-white placeholder:text-gray-400 h-12 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                style={{
                  backgroundColor: "#0f172a",
                  color: "#ffffff"
                }}
                disabled={!formData.estado || loadingMunicipios}
                required
              >
                <option value="" style={{ backgroundColor: "#0f172a", color: "#ffffff" }}>
                  {loadingMunicipios ? "Carregando..." : !formData.estado ? "Selecione um Estado primeiro" : "Selecione um Município"}
                </option>
                {municipios.map(municipio => (
                  <option key={municipio.id} value={municipio.id} style={{ backgroundColor: "#0f172a", color: "#ffffff" }}>
                    {municipio.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bairro" className="text-gray-200">Bairro / Regiao *</Label>
            <select
              id="bairro"
              value={formData.bairro}
              onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
              className="w-full bg-slate-900 border border-white/20 text-white h-12 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              style={{
                backgroundColor: "#0f172a",
                color: "#ffffff"
              }}
              disabled={!formData.municipio}
              required
            >
              <option value="" style={{ backgroundColor: "#0f172a", color: "#ffffff" }}>
                {!formData.municipio ? "Selecione um Município primeiro" : "Selecione um Bairro ou Regiao"}
              </option>
              {bairros.map((bairro) => (
                <option key={bairro} value={bairro} style={{ backgroundColor: "#0f172a", color: "#ffffff" }}>
                  {bairro}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 border-0 shadow-lg mt-4">
            Cadastrar
          </Button>
        </form>
      </div>
    </Layout>
  );
}
