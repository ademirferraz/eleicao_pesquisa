import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { ArrowLeft, Download, Share2, BarChart3, PieChart, TrendingUp } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { useToast } from "@/hooks/use-toast";
import html2canvas from 'html2canvas';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Results() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);
  const [votes, setVotes] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>({
    byCandidate: [],
    byRegion: [],
    timeline: []
  });

  useEffect(() => {
    const storedVotes = JSON.parse(localStorage.getItem("votes") || "[]");
    setVotes(storedVotes);
    processData(storedVotes);
  }, []);

  const processData = (data: any[]) => {
    // Por Candidato
    const candidateCounts = data.reduce((acc: any, vote: any) => {
      acc[vote.candidateName] = (acc[vote.candidateName] || 0) + 1;
      return acc;
    }, {});
    
    const byCandidate = Object.entries(candidateCounts).map(([name, value]) => ({
      name, value
    })).sort((a: any, b: any) => b.value - a.value);

    // Por Região (Stacked Bar)
    const regionCounts = data.reduce((acc: any, vote: any) => {
      if (!acc[vote.voterRegion]) acc[vote.voterRegion] = {};
      acc[vote.voterRegion][vote.candidateName] = (acc[vote.voterRegion][vote.candidateName] || 0) + 1;
      return acc;
    }, {});

    const byRegion = Object.entries(regionCounts).map(([region, candidates]: [string, any]) => ({
      name: region,
      ...candidates
    }));

    // Timeline (Simulada baseada na ordem de chegada)
    const timeline = data.map((_, index) => ({
      name: `Voto ${index + 1}`,
      total: index + 1
    })).filter((_, i) => i % Math.ceil(data.length / 20) === 0); // Amostragem para não poluir

    setChartData({ byCandidate, byRegion, timeline });
  };

  const handleDownload = async () => {
    if (reportRef.current) {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#0f172a', // Dark background
        scale: 2
      });
      const link = document.createElement('a');
      link.download = 'resultado-eleitoral.png';
      link.href = canvas.toDataURL();
      link.click();
      
      toast({
        title: "Relatório Salvo",
        description: "A imagem foi baixada para o seu dispositivo.",
        className: "bg-green-600 text-white border-none"
      });
    }
  };

  const handleShare = () => {
    const text = `Confira o resultado parcial da Consulta Eleitoral: ${votes.length} votos computados!`;
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

  return (
    <Layout className="max-w-7xl">
      <div className="glass-panel rounded-3xl p-6 md:p-10 w-full animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Button variant="ghost" onClick={() => setLocation("/admin-panel")} className="text-white hover:bg-white/10 gap-2">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Resultados Interativos</h1>
              <p className="text-gray-400 text-sm">Análise em tempo real da votação</p>
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
              <p className="text-4xl font-bold text-white">{votes.length}</p>
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
                {chartData.byCandidate[0] ? `${((chartData.byCandidate[0].value / votes.length) * 100).toFixed(1)}% dos votos` : "Sem dados"}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 p-6 rounded-xl border border-purple-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <PieChart className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-purple-100 font-medium">Região Mais Ativa</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                {chartData.byRegion.sort((a: any, b: any) => {
                  const sumA = Object.values(a).reduce((x: number, y: any) => (typeof y === 'number' ? x + y : x), 0);
                  const sumB = Object.values(b).reduce((x: number, y: any) => (typeof y === 'number' ? x + y : x), 0);
                  return (sumB as number) - (sumA as number);
                })[0]?.name || "N/A"}
              </p>
              <p className="text-purple-300/60 text-sm mt-1">Maior participação registrada</p>
            </div>
          </div>

          {/* Gráficos Principais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Gráfico de Barras - Candidatos */}
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" /> Desempenho por Candidato
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.byCandidate} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis type="number" stroke="#94a3b8" />
                    <YAxis dataKey="name" type="category" width={100} stroke="#94a3b8" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                      {chartData.byCandidate.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de Pizza - Distribuição */}
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-400" /> Distribuição de Votos
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={chartData.byCandidate}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.byCandidate.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de Área - Evolução Temporal */}
            <div className="bg-white/5 p-6 rounded-xl border border-white/10 lg:col-span-2">
              <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" /> Evolução da Votação (Tempo Real)
              </h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.timeline}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                    <Area type="monotone" dataKey="total" stroke="#10b981" fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>

      </div>
    </Layout>
  );
}
