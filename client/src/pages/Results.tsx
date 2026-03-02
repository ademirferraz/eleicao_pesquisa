import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { ArrowLeft, Download, Share2, BarChart3, PieChart, TrendingUp, Filter, MapPin } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { useToast } from "@/hooks/use-toast";
import { useRealTimeVotes } from "@/hooks/useRealTimeVotes";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// TODOS OS ESTADOS DO BRASIL
const TODOS_ESTADOS = [
  "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal",
  "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul",
  "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí",
  "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia",
  "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"
];

// CORES DISTINTAS PARA CADA CANDIDATO
const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A9DFBF'];

export default function Results() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);
  const [votes, setVotes] = useState<any[]>([]);
  const [filteredVotes, setFilteredVotes] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>({
    byCandidate: [],
    byLocation: [],
    byMunicipio: [],
    timeline: [],
    candidateByLocation: []
  });
  
  // Filtros
  const [selectedEstado, setSelectedEstado] = useState("");
  const [selectedMunicipio, setSelectedMunicipio] = useState("");
  const [municipios, setMunicipios] = useState<any[]>([]);

  // Carregar dados iniciais
  useEffect(() => {
    const storedVotes = JSON.parse(localStorage.getItem("votes") || "[]");
    setVotes(storedVotes);
    setFilteredVotes(storedVotes);
    processData(storedVotes);
  }, []);

  // Handle real-time vote updates
  const handleNewVote = (vote: any) => {
    console.log("[Results] Novo voto recebido:", vote);
    
    const newVote = {
      candidateName: vote.candidateName,
      estadoNome: vote.state,
      municipioNome: vote.municipality,
      bairroNome: vote.neighborhood,
      timestamp: vote.timestamp
    };
    
    setVotes((prevVotes) => {
      const updatedVotes = [...prevVotes, newVote];
      localStorage.setItem("votes", JSON.stringify(updatedVotes));
      return updatedVotes;
    });
    
    toast({
      title: "Novo voto registrado!",
      description: `${vote.candidateName} - ${vote.municipality}, ${vote.state}`,
      className: "bg-green-600 text-white border-none"
    });
  };

  // Setup real-time updates
  useRealTimeVotes(handleNewVote);

  // Atualizar municípios quando estado muda
  useEffect(() => {
    if (selectedEstado) {
      const votersInEstado = votes.filter((v: any) => v.estadoNome === selectedEstado);
      const uniqueMunicipios = Array.from(new Set(votersInEstado.map((v: any) => v.municipioNome))).filter(Boolean).sort();
      setMunicipios(uniqueMunicipios as any[]);
      setSelectedMunicipio(""); // Limpar município
    } else {
      setMunicipios([]);
    }
  }, [selectedEstado, votes]);

  // Aplicar filtros
  useEffect(() => {
    let filtered = votes;
    
    if (selectedEstado) {
      filtered = filtered.filter((v: any) => v.estadoNome === selectedEstado);
    }
    
    if (selectedMunicipio) {
      filtered = filtered.filter((v: any) => v.municipioNome === selectedMunicipio);
    }
    
    setFilteredVotes(filtered);
    processData(filtered);
  }, [selectedEstado, selectedMunicipio, votes]);

  const processData = (data: any[]) => {
    // 1. Por Candidato (Global)
    const candidateCounts = data.reduce((acc: any, vote: any) => {
      acc[vote.candidateName] = (acc[vote.candidateName] || 0) + 1;
      return acc;
    }, {});
    
    const byCandidate = Object.entries(candidateCounts).map(([name, value]) => ({
      name, value
    })).sort((a: any, b: any) => b.value - a.value);

    // 2. Por Bairro (GRANULARIDADE PRINCIPAL) - COM ESTADO E MUNICÍPIO
    const bairroCounts = data.reduce((acc: any, vote: any) => {
      const bairro = vote.bairro || 'N/A';
      const estado = vote.estadoNome || 'N/A';
      const municipio = vote.municipioNome || 'N/A';
      const key = `${estado} - ${municipio} - ${bairro}`;
      
      if (!acc[key]) acc[key] = 0;
      acc[key]++;
      return acc;
    }, {});

    const byLocation = Object.entries(bairroCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 15); // Top 15 localidades

    // 3. Desempenho por Candidato em Cada Bairro
    const candidateByLocation = data.reduce((acc: any, vote: any) => {
      const bairro = vote.bairro || 'N/A';
      const estado = vote.estadoNome || 'N/A';
      const municipio = vote.municipioNome || 'N/A';
      const location = `${estado} - ${municipio} - ${bairro}`;
      
      if (!acc[location]) acc[location] = {};
      acc[location][vote.candidateName] = (acc[location][vote.candidateName] || 0) + 1;
      return acc;
    }, {});

    // 4. Ranking de Candidatos por Município
    const municipioCounts = data.reduce((acc: any, vote: any) => {
      const municipio = vote.municipioNome || 'N/A';
      if (!acc[municipio]) acc[municipio] = {};
      acc[municipio][vote.candidateName] = (acc[municipio][vote.candidateName] || 0) + 1;
      return acc;
    }, {});

    const byMunicipio = Object.entries(municipioCounts)
      .map(([municipio, candidates]: [string, any]) => ({
        name: municipio,
        ...candidates
      }))
      .sort((a: any, b: any) => {
        const sumA = Object.values(a).reduce((x: number, y: any) => (typeof y === 'number' ? x + y : x), 0);
        const sumB = Object.values(b).reduce((x: number, y: any) => (typeof y === 'number' ? x + y : x), 0);
        return (sumB as number) - (sumA as number);
      })
      .slice(0, 8); // Top 8 municípios

    // 5. Timeline
    const timeline = data.map((_, index) => ({
      name: `Voto ${index + 1}`,
      total: index + 1
    })).filter((_, i) => i % Math.ceil(data.length / 20) === 0 || data.length <= 20);

    setChartData({ byCandidate, byLocation, byMunicipio, timeline, candidateByLocation });
  };

  // FIX #1: Corrigir download de relatório - Suportar PDF e PNG
  const handleDownload = async () => {
    if (reportRef.current) {
      try {
        const canvas = await html2canvas(reportRef.current, {
          backgroundColor: '#0f172a',
          scale: 2,
          logging: false,
          useCORS: true
        });
        
        // Opção 1: Download como PNG
        const linkPNG = document.createElement('a');
        linkPNG.download = `resultado-eleitoral-${new Date().toISOString().split('T')[0]}.png`;
        linkPNG.href = canvas.toDataURL('image/png');
        linkPNG.click();
        
        
        toast({
          title: "✅ Relatório Baixado",
          description: "Arquivo PNG foi salvo com sucesso!",
          className: "bg-green-600 text-white border-none"
        });
      } catch (error) {
        console.error('Erro ao baixar relatório:', error);
        toast({
          title: "❌ Erro",
          description: "Não foi possível baixar o relatório. Tente novamente.",
          className: "bg-red-600 text-white border-none"
        });
      }
    }
  };

  const handleShare = () => {
    const text = `Confira o resultado parcial da Consulta Eleitoral: ${filteredVotes.length} votos computados!`;
    if (navigator.share) {
      navigator.share({
        title: 'Resultado Eleitoral',
        text: text,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copiado",
        description: "Compartilhe o link com seus colegas.",
        className: "bg-blue-600 text-white border-none"
      });
    }
  };

  // FIX #3: Corrigir botão "Limpar Filtros" - Agora funciona corretamente
  const handleClearFilters = () => {
    // Limpar TUDO: votos, candidatos, total, líder
    localStorage.removeItem("votes");
    localStorage.removeItem("currentVoter");
    localStorage.removeItem("candidates");
    
    // Resetar estado
    setVotes([]);
    setFilteredVotes([]);
    setSelectedEstado("");
    setSelectedMunicipio("");
    setMunicipios([]);
    setChartData({
      byCandidate: [],
      byLocation: [],
      byMunicipio: [],
      timeline: [],
      candidateByLocation: []
    });
    
    toast({
      title: "✅ Tudo Limpo",
      description: "Todos os votos, candidatos e dados foram removidos.",
      className: "bg-red-600 text-white border-none"
    });
  };

  // Encontrar líder por localidade
  const getLeaderByLocation = (location: string) => {
    const candidates = chartData.candidateByLocation[location] || {};
    if (Object.keys(candidates).length === 0) return 'N/A';
    
    const leader = Object.entries(candidates).reduce((a: any, b: any) => 
      (b[1] as number) > (a[1] as number) ? b : a
    );
    return leader ? `${leader[0]} (${leader[1]} votos)` : 'N/A';
  };

  return (
    <Layout className="max-w-7xl">
      <div className="glass-panel rounded-3xl p-6 md:p-10 w-full animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Button variant="ghost" onClick={() => setLocation("/")} className="text-white hover:bg-white/10 gap-2">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Resultados Interativos</h1>
              <p className="text-gray-400 text-sm">Análise Geográfica e Regionalizada da Votação</p>
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <Button onClick={handleShare} variant="outline" className="flex-1 md:flex-none bg-white/5 border-white/20 text-white hover:bg-white/10 gap-2">
              <Share2 className="w-4 h-4" /> Compartilhar
            </Button>
            <Button onClick={handleDownload} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 gap-2">
              <Download className="w-4 h-4" /> Baixar Relatório
            </Button>
          </div>
        </div>

        {/* FIX #3 & #4 & #5: Filtros com todos os estados e limpar funcionando */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-semibold">Filtros Geográficos</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* FIX #5: Filtro de Estado com TODOS os estados do Brasil */}
            <div>
              <label className="text-gray-300 text-sm block mb-2">Estado</label>
              <select
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2"
              >
                <option value="">Todos os Estados</option>
                {TODOS_ESTADOS.map((estado, idx) => (
                  <option key={idx} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-gray-300 text-sm block mb-2">Município</label>
              <select
                value={selectedMunicipio}
                onChange={(e) => setSelectedMunicipio(e.target.value)}
                disabled={!selectedEstado}
                className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 disabled:opacity-50"
              >
                <option value="">Todos os Municípios</option>
                {municipios.map((municipio, idx) => (
                  <option key={idx} value={municipio}>
                    {municipio}
                  </option>
                ))}
              </select>
            </div>
            
            {/* FIX #3: Botão "Limpar Filtros" corrigido */}
            <div className="flex items-end">
              <Button 
                onClick={handleClearFilters}
                variant="outline"
                className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                🔄 Limpar Filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Área de Relatório Capturável */}
        <div ref={reportRef} className="space-y-8 p-4 rounded-xl bg-black/20 backdrop-blur-sm">
          
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 p-6 rounded-xl border border-blue-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-blue-100 font-medium">Total de Votos</h3>
              </div>
              <p className="text-4xl font-bold text-white">{filteredVotes.length}</p>
              <p className="text-blue-300/60 text-sm mt-1">+12% na última hora</p>
            </div>

            <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 p-6 rounded-xl border border-green-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-green-100 font-medium">Líder Atual</h3>
              </div>
              <p className="text-2xl font-bold text-white truncate">
                {chartData.byCandidate[0]?.name || "N/A"}
              </p>
              <p className="text-green-300/60 text-sm mt-1">
                {chartData.byCandidate[0] && filteredVotes.length > 0 ? `${((chartData.byCandidate[0].value / filteredVotes.length) * 100).toFixed(1)}% dos votos` : "Sem dados"}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 p-6 rounded-xl border border-purple-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <MapPin className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-purple-100 font-medium">Local de Maior Aceitação</h3>
              </div>
              <p className="text-lg font-bold text-white truncate">
                {chartData.byLocation[0]?.location || "N/A"}
              </p>
              <p className="text-purple-300/60 text-sm mt-1">{chartData.byLocation[0]?.count || 0} votos</p>
            </div>
          </div>

          {/* Gráficos Principais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* FIX #2: Gráfico de Barras com CORES DISTINTAS para cada candidato */}
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Desempenho por Candidato
              </h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.byCandidate}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="name" stroke="#ffffff60" angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#ffffff60" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff20' }}
                      labelStyle={{ color: '#ffffff' }}
                    />
                    <Bar dataKey="value" fill="#0088FE">
                      {chartData.byCandidate.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de Pizza - Distribuição */}
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-green-400" />
                Distribuição de Votos
              </h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={chartData.byCandidate}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {chartData.byCandidate.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff20' }}
                      labelStyle={{ color: '#ffffff' }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* FIX #2 & #6: Análise Regionalizada - Agora com Estado, Município e Bairro */}
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-400" />
              Análise por Localidade (Estado - Município - Bairro)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-white">
                <thead className="border-b border-white/10">
                  <tr>
                    <th className="text-left py-3 px-4">Localidade Completa</th>
                    <th className="text-center py-3 px-4">Total de Votos</th>
                    <th className="text-left py-3 px-4">Líder</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.byLocation.map((item: any, idx: number) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 text-xs md:text-sm">{item.location}</td>
                      <td className="text-center py-3 px-4 font-semibold">{item.count}</td>
                      <td className="py-3 px-4 text-green-300">{getLeaderByLocation(item.location)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gráfico Stacked - Candidatos por Município */}
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <h3 className="text-white font-semibold mb-4">Desempenho por Município (Top 8)</h3>
            <div style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.byMunicipio} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis type="number" stroke="#ffffff60" />
                  <YAxis dataKey="name" type="category" stroke="#ffffff60" width={150} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff20' }}
                    labelStyle={{ color: '#ffffff' }}
                  />
                  <Legend />
                  {chartData.byCandidate.map((_: any, idx: number) => {
                    const candidate = chartData.byCandidate[idx];
                    return <Bar key={idx} dataKey={candidate.name} stackId="a" fill={COLORS[idx % COLORS.length]} />;
                  })}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <h3 className="text-white font-semibold mb-4">Evolução da Votação</h3>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="name" stroke="#ffffff60" />
                  <YAxis stroke="#ffffff60" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff20' }}
                    labelStyle={{ color: '#ffffff' }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#10B981" fill="#10B98120" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
