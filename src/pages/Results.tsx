import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { ArrowLeft, Download, Filter } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useToast } from "@/hooks/use-toast";
import html2canvas from 'html2canvas';

// CORES DISTINTAS PARA CADA CANDIDATO
const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A9DFBF'];

export default function Results() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);
  
  const [votes, setVotes] = useState<any[]>([]);
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [filteredVotes, setFilteredVotes] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedEstado, setSelectedEstado] = useState("");
  const [selectedMunicipio, setSelectedMunicipio] = useState("");
  const [selectedBairro, setSelectedBairro] = useState("");
  const [municipios, setMunicipios] = useState<string[]>([]);
  const [bairros, setBairros] = useState<string[]>([]);

  const ESTADOS_BRASIL = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
    "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

  // Carregar dados iniciais
  useEffect(() => {
    const storedVotes = JSON.parse(localStorage.getItem("votes") || "[]");
    const storedCands = JSON.parse(localStorage.getItem("candidatos") || "[]");
    setVotes(storedVotes);
    setCandidatos(storedCands);
    setFilteredVotes(storedVotes);
    processData(storedVotes, storedCands);
  }, []);

  // Processar dados para gráficos
  const processData = (votesData: any[], candsData: any[]) => {
    if (votesData.length === 0 || candsData.length === 0) {
      setChartData([]);
      return;
    }

    // Contar votos por candidato
    const votesByCandidate: { [key: string]: number } = {};
    candsData.forEach((c: any) => {
      votesByCandidate[c.name] = 0;
    });

    votesData.forEach((v: any) => {
      if (votesByCandidate[v.candidateName] !== undefined) {
        votesByCandidate[v.candidateName]++;
      }
    });

    const data = Object.entries(votesByCandidate).map(([name, votes]) => ({
      name,
      votos: votes
    }));

    setChartData(data);
  };

  // Atualizar municípios quando estado muda
  useEffect(() => {
    if (selectedEstado) {
      const votersInEstado = votes.filter((v: any) => v.estado === selectedEstado);
      const uniqueMunicipios = Array.from(new Set(votersInEstado.map((v: any) => v.municipio))).filter(Boolean).sort();
      setMunicipios(uniqueMunicipios as string[]);
      setSelectedMunicipio("");
      setSelectedBairro("");
      setBairros([]);
    } else {
      setMunicipios([]);
      setSelectedMunicipio("");
      setSelectedBairro("");
      setBairros([]);
    }
  }, [selectedEstado, votes]);

  // Atualizar bairros quando município muda
  useEffect(() => {
    if (selectedMunicipio && selectedEstado) {
      const votersInMunicipio = votes.filter((v: any) => v.estado === selectedEstado && v.municipio === selectedMunicipio);
      const uniqueBairros = Array.from(new Set(votersInMunicipio.map((v: any) => v.bairro))).filter(Boolean).sort();
      setBairros(uniqueBairros as string[]);
      setSelectedBairro("");
    } else {
      setBairros([]);
      setSelectedBairro("");
    }
  }, [selectedMunicipio, selectedEstado, votes]);

  // Aplicar filtros
  useEffect(() => {
    let filtered = votes;
    
    if (selectedEstado) {
      filtered = filtered.filter((v: any) => v.estado === selectedEstado);
    }
    if (selectedMunicipio) {
      filtered = filtered.filter((v: any) => v.municipio === selectedMunicipio);
    }
    if (selectedBairro) {
      filtered = filtered.filter((v: any) => v.bairro === selectedBairro);
    }
    
    setFilteredVotes(filtered);
    processData(filtered, candidatos);
  }, [selectedEstado, selectedMunicipio, selectedBairro, votes, candidatos]);

  // Limpar filtros
  const handleClearFilters = () => {
    setSelectedEstado("");
    setSelectedMunicipio("");
    setSelectedBairro("");
    setMunicipios([]);
    setBairros([]);
    setFilteredVotes(votes);
    processData(votes, candidatos);
    
    localStorage.removeItem("votes");
    localStorage.removeItem("candidatos");
    setVotes([]);
    setCandidatos([]);
    setChartData([]);
    
    toast({
      title: "Filtros Limpos",
      description: "Todos os dados foram zerados!",
      className: "bg-red-600 text-white border-none"
    });
  };

  // Encontrar local de maior aceitação
  const getTopLocation = () => {
    if (filteredVotes.length === 0) return null;
    
    const locationCounts: { [key: string]: number } = {};
    filteredVotes.forEach((v: any) => {
      const key = v.bairro || v.municipio || v.estado;
      locationCounts[key] = (locationCounts[key] || 0) + 1;
    });

    const topLocation = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0];
    return topLocation ? { name: topLocation[0], count: topLocation[1] } : null;
  };

  // Download relatório
  const handleDownload = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#1a1a1a',
        scale: 2
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `relatorio-votacao-${new Date().toISOString().split('T')[0]}.png`;
      link.click();

      toast({
        title: "Download Iniciado",
        description: "Relatório foi baixado com sucesso!",
        className: "bg-green-600 text-white border-none"
      });
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório.",
        variant: "destructive"
      });
    }
  };

  const topLocation = getTopLocation();
  const totalVotes = filteredVotes.length;
  const topCandidate = chartData.length > 0 ? chartData.reduce((prev, current) => (prev.votos > current.votos) ? prev : current) : null;

  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Resultados da Votação</h1>
          <Button onClick={() => setLocation("/")} variant="outline" className="text-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
        </div>

        {/* Filtros */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5" /> Filtros
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-gray-300 text-sm">Estado</label>
              <select 
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
                className="w-full mt-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
              >
                <option value="">Todos</option>
                {ESTADOS_BRASIL.map(est => (
                  <option key={est} value={est}>{est}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-gray-300 text-sm">Município</label>
              <select 
                value={selectedMunicipio}
                onChange={(e) => setSelectedMunicipio(e.target.value)}
                disabled={!selectedEstado}
                className="w-full mt-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white disabled:opacity-50"
              >
                <option value="">Todos</option>
                {municipios.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-gray-300 text-sm">Bairro</label>
              <select 
                value={selectedBairro}
                onChange={(e) => setSelectedBairro(e.target.value)}
                disabled={!selectedMunicipio}
                className="w-full mt-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white disabled:opacity-50"
              >
                <option value="">Todos</option>
                {bairros.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleClearFilters} className="w-full bg-red-600 hover:bg-red-700">
                Limpar Filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Relatório */}
        <div ref={reportRef} className="bg-white/5 rounded-2xl p-8 border border-white/10">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-black/20 p-6 rounded-xl text-center border border-white/5">
              <p className="text-gray-400 text-sm">TOTAL DE VOTOS</p>
              <p className="text-4xl font-bold text-white mt-2">{totalVotes}</p>
            </div>
            <div className="bg-black/20 p-6 rounded-xl text-center border border-white/5">
              <p className="text-gray-400 text-sm">LÍDER ATUAL</p>
              <p className="text-2xl font-bold text-green-400 mt-2">{topCandidate?.name || "-"}</p>
              <p className="text-gray-400 text-sm mt-1">{topCandidate?.votos || 0} votos</p>
            </div>
            <div className="bg-black/20 p-6 rounded-xl text-center border border-white/5">
              <p className="text-gray-400 text-sm">LOCAL DE MAIOR ACEITAÇÃO</p>
              <p className="text-2xl font-bold text-blue-400 mt-2">{topLocation?.name || "-"}</p>
              <p className="text-gray-400 text-sm mt-1">{topLocation?.count || 0} votos</p>
            </div>
          </div>

          {/* Gráfico de Barras com Fotos */}
          {chartData.length > 0 ? (
            <div className="mb-8">
              <h3 className="text-white font-bold mb-4">Votos por Candidato</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {chartData.map((entry, index) => {
                  const candidate = candidatos.find(c => c.name === entry.name);
                  return (
                    <div key={entry.name} className="bg-black/20 p-4 rounded-lg border border-white/10">
                      {candidate?.photo && (
                        <img src={candidate.photo} alt={entry.name} className="w-full h-32 rounded-lg object-cover mb-3" />
                      )}
                      <p className="text-white font-semibold">{entry.name}</p>
                      <p className="text-2xl font-bold text-blue-400 mt-2">{entry.votos} votos</p>
                    </div>
                  );
                })}
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.2)' }} />
                  <Bar dataKey="votos" fill="#4ECDC4" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>Nenhum voto registrado ainda</p>
            </div>
          )}

          {/* Tabela de Votos */}
          {filteredVotes.length > 0 && (
            <div className="mt-8">
              <h3 className="text-white font-bold mb-4">Detalhes dos Votos</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-300">Candidato</th>
                      <th className="text-left py-3 px-4 text-gray-300">Estado</th>
                      <th className="text-left py-3 px-4 text-gray-300">Município</th>
                      <th className="text-left py-3 px-4 text-gray-300">Bairro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVotes.map((vote, idx) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4 text-white">{vote.candidateName}</td>
                        <td className="py-3 px-4 text-gray-300">{vote.estado}</td>
                        <td className="py-3 px-4 text-gray-300">{vote.municipio}</td>
                        <td className="py-3 px-4 text-gray-300">{vote.bairro}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Download Button */}
        <div className="flex justify-center">
          <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
            <Download className="w-5 h-5 mr-2" /> Baixar Relatório (PNG)
          </Button>
        </div>
      </div>
    </Layout>
  );
}
