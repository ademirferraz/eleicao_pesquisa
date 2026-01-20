import { useState } from "react";
import { useLocation } from "wouter";
import InputMask from "react-input-mask";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { ArrowLeft, LogOut, MapPin } from "lucide-react";

// Componente de Mapa Simplificado (SVG Interativo)
const BrazilMap = ({ onSelectRegion, selectedRegion }: { onSelectRegion: (region: string) => void, selectedRegion: string }) => {
  const regions = [
    { id: "Norte", color: "fill-green-600", path: "M220,50 L350,50 L380,150 L250,200 L150,150 Z", labelX: 280, labelY: 120 },
    { id: "Nordeste", color: "fill-orange-500", path: "M380,150 L500,120 L520,250 L400,250 Z", labelX: 450, labelY: 180 },
    { id: "Centro-Oeste", color: "fill-yellow-500", path: "M250,200 L400,250 L380,350 L280,320 Z", labelX: 330, labelY: 280 },
    { id: "Sudeste", color: "fill-red-500", path: "M400,250 L520,250 L480,400 L380,350 Z", labelX: 450, labelY: 320 },
    { id: "Sul", color: "fill-blue-500", path: "M280,320 L380,350 L480,400 L350,480 L250,400 Z", labelX: 350, labelY: 400 }
  ];

  return (
    <div className="relative w-full h-64 bg-white/5 rounded-lg border border-white/10 overflow-hidden flex items-center justify-center">
      <svg viewBox="0 0 600 500" className="w-full h-full drop-shadow-xl">
        {regions.map((region) => (
          <g key={region.id} onClick={() => onSelectRegion(region.id)} className="cursor-pointer transition-all hover:opacity-80">
            <path 
              d={region.path} 
              className={`${region.color} stroke-white stroke-2 ${selectedRegion === region.id ? 'opacity-100 brightness-125 stroke-[4px]' : 'opacity-60'}`}
            />
            <text x={region.labelX} y={region.labelY} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" className="pointer-events-none drop-shadow-md">
              {region.id}
            </text>
          </g>
        ))}
      </svg>
      {!selectedRegion && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm text-sm animate-pulse">
            Clique em uma região para selecionar
          </span>
        </div>
      )}
    </div>
  );
};

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    birthDate: "",
    region: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateAge = (dateString: string) => {
    const [day, month, year] = dateString.split('/').map(Number);
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
    if (!formData.name || !formData.cpf || !formData.birthDate || !formData.region) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos e selecione uma região.",
        variant: "destructive"
      });
      return;
    }

    // Validação de Idade
    const age = validateAge(formData.birthDate);
    if (age < 16) {
      toast({
        title: "Você não pode votar",
        description: `Você tem ${age} anos. A idade mínima é 16 anos.`,
        variant: "destructive"
      });
      return;
    }

    // Salvar dados temporariamente (simulação)
    localStorage.setItem("currentVoter", JSON.stringify(formData));
    
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
          <Button variant="destructive" onClick={() => window.location.href = "https://google.com"} className="gap-2 bg-red-500/80 hover:bg-red-600">
            <LogOut className="w-4 h-4" /> Sair do App
          </Button>
        </div>

        <h2 className="text-3xl font-bold text-white mb-6 text-center">Cadastro de Eleitor</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-200">Nome Completo</Label>
            <Input 
              id="name" 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Digite seu nome completo" 
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="cpf" className="text-gray-200">CPF</Label>
              <InputMask 
                mask="999.999.999-99" 
                value={formData.cpf} 
                onChange={handleInputChange}
              >
                {/* @ts-ignore - InputMask children type issue */}
                {(inputProps: any) => (
                  <Input 
                    {...inputProps}
                    id="cpf" 
                    name="cpf"
                    placeholder="XXX.XXX.XXX-XX" 
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12"
                  />
                )}
              </InputMask>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate" className="text-gray-200">Data de Nascimento</Label>
              <InputMask 
                mask="99/99/9999" 
                value={formData.birthDate} 
                onChange={handleInputChange}
              >
                {/* @ts-ignore */}
                {(inputProps: any) => (
                  <Input 
                    {...inputProps}
                    id="birthDate" 
                    name="birthDate"
                    placeholder="DD/MM/AAAA" 
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12"
                  />
                )}
              </InputMask>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-200 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Selecione sua Região
            </Label>
            <BrazilMap 
              selectedRegion={formData.region} 
              onSelectRegion={(region) => setFormData(prev => ({ ...prev, region }))} 
            />
            {formData.region && (
              <p className="text-green-400 text-sm font-medium text-center mt-2">
                Região selecionada: {formData.region}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 border-0 shadow-lg mt-4">
            Cadastrar
          </Button>
        </form>
      </div>
    </Layout>
  );
}
