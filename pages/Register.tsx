import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { isValidCPF, calculateAge } from "@/utils/validation";

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

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [cidadeGravada, setCidadeGravada] = useState("");
  const [estadoGravado, setEstadoGravado] = useState("");
  const [localidade, setLocalidade] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    birthDate: "",
  });

  const [validation, setValidation] = useState({
    cpf: { isValid: false, isTouched: false },
    birthDate: { isValid: false, isTouched: false, age: -1 },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carregar configuração da eleição ao montar
  useEffect(() => {
    const cidade = localStorage.getItem("eleicao_cidade") || "Não definida";
    const estado = localStorage.getItem("eleicao_estado") || "—";
    setCidadeGravada(cidade);
    setEstadoGravado(estado);
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData((prev) => ({ ...prev, cpf: formatted }));

    if (formatted.length === 14) {
      const isValid = isValidCPF(formatted);
      setValidation((prev) => ({
        ...prev,
        cpf: { isValid, isTouched: true },
      }));
    } else if (formatted.length > 0) {
      setValidation((prev) => ({
        ...prev,
        cpf: { isValid: false, isTouched: true },
      }));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDate(e.target.value);
    setFormData((prev) => ({ ...prev, birthDate: formatted }));

    if (formatted.length === 10) {
      const [day, month, year] = formatted.split("/");
      const birthDate = new Date(`${year}-${month}-${day}`);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const isValidDateFormat =
        !isNaN(birthDate.getTime()) && age >= 16 && age <= 120;

      setValidation((prev) => ({
        ...prev,
        birthDate: { isValid: isValidDateFormat, isTouched: true, age },
      }));
    } else if (formatted.length > 0) {
      setValidation((prev) => ({
        ...prev,
        birthDate: { isValid: false, isTouched: true, age: -1 },
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validation.cpf.isValid || !validation.birthDate.isValid) {
      toast({
        title: "Erro",
        description: "CPF ou data de nascimento inválidos",
        variant: "destructive",
      });
      return;
    }

    if (!localidade.trim()) {
      toast({
        title: "Erro",
        description: "Selecione sua localidade",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Verificar se CPF já foi cadastrado
      const voters = JSON.parse(localStorage.getItem("voters") || "[]");
      const cpfLimpo = formData.cpf.replace(/\D/g, "");
      const cpfExistente = voters.some(
        (v: any) => v.cpf.replace(/\D/g, "") === cpfLimpo
      );

      if (cpfExistente) {
        toast({
          title: "Erro",
          description: "Este CPF já foi cadastrado",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Adicionar novo eleitor
      const novoEleitor = {
        id: Date.now(),
        name: formData.name,
        cpf: formData.cpf,
        birthDate: formData.birthDate,
        localidade: localidade,
        estado: estadoGravado,
        cidade: cidadeGravada,
        hasVoted: false,
        timestamp: new Date().toISOString(),
      };

      voters.push(novoEleitor);
      localStorage.setItem("voters", JSON.stringify(voters));

      toast({
        title: "Sucesso!",
        description: "Cadastro realizado com sucesso. Você pode votar agora!",
      });

      // Redirecionar para votação
      setTimeout(() => {
        setLocation("/votacao");
      }, 1500);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao cadastrar eleitor",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    validation.cpf.isValid &&
    validation.birthDate.isValid &&
    formData.name.trim() &&
    localidade;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Cadastro do Eleitor</h1>
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>
        </div>

        {/* Informações da Eleição */}
        <div className="mb-6 p-4 bg-blue-900/50 rounded border border-blue-500">
          <p className="text-blue-200 font-bold text-center">
            Eleição em: <strong>{cidadeGravada} - {estadoGravado}</strong>
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome Completo */}
          <div>
            <Label className="block mb-2 font-bold">Nome Completo</Label>
            <Input
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Digite seu nome completo"
              className="bg-slate-800 text-white p-3 rounded w-full border border-slate-600"
              disabled={isSubmitting}
            />
          </div>

          {/* CPF */}
          <div>
            <Label className="block mb-2 font-bold">CPF</Label>
            <div className="relative">
              <Input
                type="text"
                value={formData.cpf}
                onChange={handleCPFChange}
                placeholder="000.000.000-00"
                maxLength={14}
                className="bg-slate-800 text-white p-3 rounded w-full pr-12 border border-slate-600"
                disabled={isSubmitting}
              />
              {validation.cpf.isTouched && (
                <div className="absolute right-3 top-3">
                  {validation.cpf.isValid ? (
                    <CheckCircle2 className="text-green-500" size={24} />
                  ) : (
                    <AlertCircle className="text-red-500" size={24} />
                  )}
                </div>
              )}
            </div>
            {validation.cpf.isTouched && !validation.cpf.isValid && (
              <p className="text-red-400 text-sm mt-1">CPF inválido</p>
            )}
            {validation.cpf.isValid && (
              <p className="text-green-400 text-sm mt-1">✓ CPF válido</p>
            )}
          </div>

          {/* Data de Nascimento */}
          <div>
            <Label className="block mb-2 font-bold">Data de Nascimento</Label>
            <div className="relative">
              <Input
                type="text"
                value={formData.birthDate}
                onChange={handleDateChange}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                className="bg-slate-800 text-white p-3 rounded w-full pr-12 border border-slate-600"
                disabled={isSubmitting}
              />
              {validation.birthDate.isTouched && (
                <div className="absolute right-3 top-3">
                  {validation.birthDate.isValid ? (
                    <CheckCircle2 className="text-green-500" size={24} />
                  ) : (
                    <AlertCircle className="text-red-500" size={24} />
                  )}
                </div>
              )}
            </div>
            {validation.birthDate.isTouched && !validation.birthDate.isValid && (
              <p className="text-red-400 text-sm mt-1">
                Data inválida ou eleitor menor de 16 anos
              </p>
            )}
            {validation.birthDate.isValid && (
              <p className="text-green-400 text-sm mt-1">
                ✓ Você tem {validation.birthDate.age} anos (elegível)
              </p>
            )}
          </div>

          {/* Localidade */}
          <div>
            <Label className="block mb-2 font-bold">Onde você reside?</Label>
            <select
              value={localidade}
              onChange={(e) => setLocalidade(e.target.value)}
              className="w-full p-3 bg-white text-black rounded border border-gray-300"
              disabled={isSubmitting}
            >
              <option value="">Selecione sua localidade...</option>
              <option value="Centro">Centro</option>
              <option value="Bairro Novo">Bairro Novo</option>
              <option value="Vila Maria">Vila Maria</option>
              <option value="Cohab">Cohab</option>
              <option value="Zona Rural / Fazenda">Zona Rural / Fazenda</option>
            </select>
          </div>

          {/* Botão Confirmar */}
          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 p-4 font-bold text-lg rounded"
          >
            {isSubmitting ? "Processando..." : "CONFIRMAR E VOTAR"}
          </Button>
        </form>
      </div>
    </div>
  );
}
