import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Save, Trash2, ArrowLeft, Plus, X, Upload } from "lucide-react";

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Estado e Cidade
  const [estado, setEstado] = useState(localStorage.getItem("eleicao_estado") || "PE");
  const [cidade, setCidade] = useState(localStorage.getItem("eleicao_cidade") || "");

  // Candidatos
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [novoNumero, setNovoNumero] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [novoPartido, setNovoPartido] = useState("");
  const [novaFoto, setNovaFoto] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const ESTADOS = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

  // Carregar candidatos ao montar
  useEffect(() => {
    const candidatosSalvos = localStorage.getItem("candidatos");
    if (candidatosSalvos) {
      setCandidatos(JSON.parse(candidatosSalvos));
    }
  }, []);

  // Função para Gravar Estado e Cidade
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

  // Função para Incluir Candidato
  const incluirCandidato = () => {
    if (!novoNumero.trim() || !novoNome.trim() || !novoPartido.trim()) {
      toast({ title: "Erro", description: "Preencha todos os campos!", variant: "destructive" });
      return;
    }

    const novoCandidato = {
      id: Date.now(),
      numero: novoNumero,
      nome: novoNome,
      partido: novoPartido,
      foto: novaFoto
    };

    const novosCandidatos = [...candidatos, novoCandidato];
    setCandidatos(novosCandidatos);
    localStorage.setItem("candidatos", JSON.stringify(novosCandidatos));

    toast({ title: "Sucesso!", description: `${novoNome} adicionado!` });
    setNovoNumero("");
    setNovoNome("");
    setNovoPartido("");
    setNovaFoto(null);
    setMostrarFormulario(false);
  };

  // Função para Excluir Candidato
  const excluirCandidato = (id: number) => {
    if (confirm("Deseja excluir este candidato?")) {
      const novosCandidatos = candidatos.filter(c => c.id !== id);
      setCandidatos(novosCandidatos);
      localStorage.setItem("candidatos", JSON.stringify(novosCandidatos));
      toast({ title: "Sucesso!", description: "Candidato removido!" });
    }
  };

  // Função para Upload de Foto
  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNovaFoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Função para Limpar Candidatos
  const limparCandidatos = () => {
    if (confirm("Deseja apagar TODOS os candidatos cadastrados?")) {
      localStorage.removeItem("candidatos");
      setCandidatos([]);
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

  // Função para Limpar Eleitores
  const limparEleitores = () => {
    if (confirm("Deseja apagar TODOS os eleitores cadastrados?")) {
      localStorage.removeItem("voters");
      toast({ title: "Sucesso", description: "Eleitores removidos!" });
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl">
          <h1 className="text-xl font-bold text-white">Configurações do Sistema</h1>
          <Button onClick={() => setLocation("/")} variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </div>

        {/* CONFIGURAÇÃO DE ESTADO E CIDADE */}
        <div className="bg-slate-800 p-8 rounded-2xl border border-white/10 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
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

            <div className="space-y-2">
              <Label className="text-gray-300 font-bold">2. Digite a Cidade</Label>
              <Input
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Nome da cidade"
                className="bg-black text-white border-2 border-slate-700 p-6 rounded-lg font-bold placeholder:text-gray-600 focus:border-blue-500"
              />
            </div>

            <Button 
              onClick={salvarConfiguracao}
              className="bg-blue-600 hover:bg-blue-700 h-12 font-black text-lg"
            >
              <Save className="mr-2" /> GRAVAR
            </Button>
          </div>
        </div>

        {/* INCLUIR CANDIDATO */}
        <div className="bg-slate-800 p-8 rounded-2xl border border-white/10 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Candidatos</h2>
            <Button 
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="bg-green-600 hover:bg-green-700 font-bold"
            >
              <Plus className="mr-2" /> INCLUIR CANDIDATO
            </Button>
          </div>

          {/* Formulário de Novo Candidato */}
          {mostrarFormulario && (
            <div className="bg-slate-900 p-6 rounded-lg mb-6 border border-green-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-gray-300 font-bold">Número</Label>
                  <Input
                    value={novoNumero}
                    onChange={(e) => setNovoNumero(e.target.value)}
                    placeholder="Ex: 1"
                    className="bg-black text-white border-2 border-slate-700 mt-2"
                  />
                </div>
                <div>
                  <Label className="text-gray-300 font-bold">Nome</Label>
                  <Input
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Nome do candidato"
                    className="bg-black text-white border-2 border-slate-700 mt-2"
                  />
                </div>
                <div>
                  <Label className="text-gray-300 font-bold">Partido</Label>
                  <Input
                    value={novoPartido}
                    onChange={(e) => setNovoPartido(e.target.value)}
                    placeholder="Sigla do partido"
                    className="bg-black text-white border-2 border-slate-700 mt-2"
                  />
                </div>
                <div>
                  <Label className="text-gray-300 font-bold">Foto</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFotoUpload}
                      className="hidden"
                      id="foto-input"
                    />
                    <label htmlFor="foto-input" className="cursor-pointer">
                      <Button 
                        type="button"
                        variant="outline"
                        className="w-full border-2 border-slate-700 text-white"
                        onClick={() => document.getElementById("foto-input")?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" /> Selecionar Foto
                      </Button>
                    </label>
                  </div>
                </div>
              </div>

              {/* Preview da Foto */}
              {novaFoto && (
                <div className="mb-4">
                  <img src={novaFoto} alt="Preview" className="h-32 w-32 object-cover rounded-lg" />
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={incluirCandidato}
                  className="flex-1 bg-green-600 hover:bg-green-700 font-bold"
                >
                  <Plus className="mr-2" /> ADICIONAR
                </Button>
                <Button 
                  onClick={() => {
                    setMostrarFormulario(false);
                    setNovoNumero("");
                    setNovoNome("");
                    setNovoPartido("");
                    setNovaFoto(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  CANCELAR
                </Button>
              </div>
            </div>
          )}

          {/* Lista de Candidatos */}
          <div className="space-y-3">
            {candidatos.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Nenhum candidato cadastrado</p>
            ) : (
              candidatos.map(candidato => (
                <div key={candidato.id} className="bg-slate-900 p-4 rounded-lg flex items-center justify-between border border-slate-700">
                  <div className="flex items-center gap-4">
                    {candidato.foto && (
                      <img src={candidato.foto} alt={candidato.nome} className="h-16 w-16 object-cover rounded" />
                    )}
                    <div>
                      <p className="text-white font-bold">#{candidato.numero} - {candidato.nome}</p>
                      <p className="text-gray-400">{candidato.partido}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => excluirCandidato(candidato.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" /> EXCLUIR
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* BOTÕES DE LIMPEZA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={limparCandidatos}
            variant="destructive"
            className="h-14 font-bold border-2 border-red-900 shadow-lg"
          >
            <Trash2 className="mr-2" /> LIMPAR CANDIDATOS
          </Button>
          
          <Button 
            onClick={zerarVotos}
            className="h-14 bg-amber-600 hover:bg-amber-700 font-bold"
          >
            🔄 ZERAR VOTOS
          </Button>

          <Button 
            onClick={limparEleitores}
            className="h-14 bg-purple-600 hover:bg-purple-700 font-bold"
          >
            👥 LIMPAR ELEITORES
          </Button>
        </div>
      </div>
    </Layout>
  );
}
