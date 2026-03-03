import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Trash2, Save, Upload } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [estado, setEstado] = useState("PE");
  const [cidade, setCidade] = useState("");
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [novoNome, setNovoNome] = useState("");

  // Carregar dados do localStorage ao montar
  useEffect(() => {
    const estadoSalvo = localStorage.getItem("eleicao_estado") || "PE";
    const cidadeSalva = localStorage.getItem("eleicao_cidade") || "";
    const candidatosSalvos = localStorage.getItem("eleicao_candidatos");

    setEstado(estadoSalvo);
    setCidade(cidadeSalva);
    if (candidatosSalvos) {
      setCandidatos(JSON.parse(candidatosSalvos));
    }
  }, []);

  // 1. FUNÇÃO DO BOTÃO GRAVAR (Estado e Cidade)
  const gravarConfiguracao = () => {
    if (!cidade.trim()) {
      toast({
        title: "Erro",
        description: "Digite a cidade antes de gravar!",
        variant: "destructive",
      });
      return;
    }
    localStorage.setItem("eleicao_estado", estado);
    localStorage.setItem("eleicao_cidade", cidade);
    toast({
      title: "Sucesso!",
      description: `Eleição configurada para ${cidade} - ${estado}`,
    });
  };

  // 2. FUNÇÃO DA FOTO REAL (Vincula ao nome e abre galeria/arquivo)
  const selecionarFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo || !novoNome.trim()) {
      toast({
        title: "Erro",
        description: "Digite o nome do candidato antes de escolher a foto!",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const novoCandidato = {
        id: Date.now(),
        numero: Math.floor(Math.random() * 10000),
        nome: novoNome,
        partido: "Partido",
        cargo: "Vereador",
        foto: reader.result, // Aqui a imagem vira texto para o localStorage
        votos: 0,
      };
      const listaAtualizada = [...candidatos, novoCandidato];
      setCandidatos(listaAtualizada);
      localStorage.setItem("eleicao_candidatos", JSON.stringify(listaAtualizada));
      setNovoNome(""); // Limpa o campo de nome
      toast({
        title: "Sucesso!",
        description: `Candidato ${novoNome} adicionado com foto!`,
      });
    };
    reader.readAsDataURL(arquivo);
  };

  // Remover candidato
  const removerCandidato = (id: number) => {
    const listaAtualizada = candidatos.filter((c) => c.id !== id);
    setCandidatos(listaAtualizada);
    localStorage.setItem("eleicao_candidatos", JSON.stringify(listaAtualizada));
    toast({
      title: "Candidato removido",
      description: "O candidato foi removido com sucesso.",
    });
  };

  // 3. FUNÇÃO ZERAR TUDO (Limpa memória total)
  const zerarTudo = () => {
    if (
      confirm(
        "ATENÇÃO: Isso apagará TODOS os candidatos, fotos, cidades e votos. Confirma?"
      )
    ) {
      localStorage.clear(); // Limpa o localStorage do navegador
      setEstado("PE");
      setCidade("");
      setCandidatos([]);
      toast({
        title: "Sistema resetado",
        description: "Todos os dados foram apagados com sucesso!",
      });
      setTimeout(() => window.location.reload(), 1000); // Recarrega a página
    }
  };

  const ESTADOS = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Painel do Administrador</h1>
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>
        </div>

        {/* Bloco Estado e Cidade */}
        <div className="mb-8 p-6 border border-blue-500 rounded-lg bg-slate-800">
          <h2 className="text-xl font-bold mb-4">Configuração da Eleição</h2>
          <p className="text-sm text-gray-300 mb-4">
            <strong>Persistir Simulação:</strong> Salvar os dados da eleição (estado, cidade, candidatos, votos) no navegador para que continuem disponíveis mesmo após fechar e reabrir.
          </p>
          
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Label className="block mb-2">Estado</Label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full bg-black text-white p-3 rounded border border-slate-600"
              >
                {ESTADOS.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Label className="block mb-2">Cidade</Label>
              <Input
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Digite o nome da cidade"
                className="bg-white text-black"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={gravarConfiguracao}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 font-bold flex items-center gap-2"
              >
                <Save size={20} />
                GRAVAR
              </Button>
            </div>
          </div>

          {cidade && estado && (
            <div className="mt-4 p-3 bg-blue-900/50 rounded border border-blue-500">
              <p className="text-blue-200">
                ✓ Eleição configurada para: <strong>{cidade} - {estado}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Bloco Candidato e Foto */}
        <div className="mb-8 p-6 border border-green-500 rounded-lg bg-slate-800">
          <h2 className="text-xl font-bold mb-4">Adicionar Candidato</h2>

          <div className="flex gap-4 flex-wrap mb-6">
            <div className="flex-1 min-w-[250px]">
              <Label className="block mb-2">Nome do Candidato</Label>
              <Input
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Digite o nome do candidato"
                className="bg-white text-black"
              />
            </div>

            <div className="flex items-end">
              <label className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded cursor-pointer font-bold flex items-center gap-2 transition">
                <Upload size={20} />
                FOTO (Galeria/Pasta)
                <input
                  type="file"
                  accept="image/*"
                  onChange={selecionarFoto}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Lista de Candidatos */}
        {candidatos.length > 0 && (
          <div className="mb-8 p-6 border border-purple-500 rounded-lg bg-slate-800">
            <h2 className="text-xl font-bold mb-4">
              Candidatos Cadastrados ({candidatos.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {candidatos.map((candidato) => (
                <div
                  key={candidato.id}
                  className="p-4 bg-slate-700 rounded border border-slate-600 hover:border-purple-500 transition"
                >
                  {candidato.foto && (
                    <img
                      src={candidato.foto}
                      alt={candidato.nome}
                      className="w-full h-40 object-cover rounded mb-3"
                    />
                  )}
                  <h3 className="font-bold text-lg mb-2">{candidato.nome}</h3>
                  <p className="text-sm text-gray-300 mb-3">
                    Votos: <strong>{candidato.votos}</strong>
                  </p>
                  <button
                    onClick={() => removerCandidato(candidato.id)}
                    className="w-full bg-red-600 hover:bg-red-700 px-3 py-2 rounded font-bold flex items-center justify-center gap-2 transition"
                  >
                    <Trash2 size={18} />
                    Remover
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botão Vermelho Zerar */}
        <div className="mt-12">
          <Button
            onClick={zerarTudo}
            className="w-full bg-red-600 hover:bg-red-700 p-6 font-bold text-lg"
          >
            ⚠️ ZERAR TUDO (LIMPAR MEMÓRIA)
          </Button>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Aviso: Esta ação não pode ser desfeita. Todos os dados serão apagados.
          </p>
        </div>
      </div>
    </div>
  );
}
