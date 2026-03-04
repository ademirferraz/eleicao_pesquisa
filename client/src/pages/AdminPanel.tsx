import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Save, Trash2, ArrowLeft, MapPin } from "lucide-react";

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // 1 & 2 - Estados para Estado e Cidade
  const [estado, setEstado] = useState(localStorage.getItem("eleicao_estado") || "PE");
  const [cidade, setCidade] = useState(localStorage.getItem("eleicao_cidade") || "");

  const ESTADOS = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

  // Função para Gravar
  const salvarConfiguracao = () => {
    if (!cidade.trim()) {
      toast({ title: "Erro", description: "Preencha a cidade!", variant: "destructive" });
      return;
    }
    localStorage.setItem("eleicao_estado", estado);
    localStorage.setItem("eleicao_cidade", cidade);
    toast({ 
      title: "Gravado!", 
      description: `Configurado para ${cidade}-${estado}`,
      className: "bg-green-600 text-white" 
    });
  };

  // 4 - Função para Limpar Cadastrados (Candidatos)
  const limparCandidatos = () => {
    if (confirm("Deseja apagar TODOS os candidatos cadastrados?")) {
      localStorage.removeItem("candidatos");
      toast({ title: "Sucesso", description: "Candidatos removidos!" });
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  // Função para Zerar Votos
  const zerarVotos = () => {
    if (confirm("Deseja apagar TODOS os votos registrados?")) {
      localStorage.removeItem("votes");
      toast({ title: "Sucesso", description: "Votos zerados!" });
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl">
          <h1 className="text-xl font-bold text-white">Configurações do Sistema</h1>
          <Button onClick={() => setLocation("/")} variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </div>

        <div className="bg-slate-800 p-8 rounded-2xl border border-white/10 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            
            {/* 1 - Menu de Estado */}
            <div className="space-y-2">
              <Label className="text-gray-300 font-bold">1. Escolha o Estado</Label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full bg-slate-950 text-white border-2 border-slate-700 p-3 rounded-lg focus:border-blue-500 outline-none font-bold"
              >
                {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>

            {/* 2 & 3 - Campo Cidade (Fundo Preto / Fonte Branca) */}
            <div className="space-y-2">
              <Label className="text-gray-300 font-bold">2. Digite a Cidade</Label>
              <Input
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Nome da cidade"
                className="bg-black text-white border-2 border-slate-700 p-6 rounded-lg font-bold placeholder:text-gray-600 focus:border-blue-500"
              />
            </div>

            {/* Botão Gravar */}
            <Button 
              onClick={salvarConfiguracao}
              className="bg-blue-600 hover:bg-blue-700 h-12 font-black text-lg"
            >
              <Save className="mr-2" /> GRAVAR
            </Button>
          </div>
        </div>

        {/* 4 - Botão Limpar Cadastrados */}
        <div className="flex gap-4">
          <Button 
            onClick={limparCandidatos}
            variant="destructive"
            className="flex-1 h-14 font-bold border-2 border-red-900 shadow-lg"
          >
            <Trash2 className="mr-2" /> LIMPAR CANDIDATOS CADASTRADOS
          </Button>
          
          <Button 
            onClick={zerarVotos}
            className="flex-1 h-14 bg-amber-600 hover:bg-amber-700 font-bold"
          >
            🔄 ZERAR APENAS VOTOS
          </Button>
        </div>
      </div>
    </Layout>
  );
}
