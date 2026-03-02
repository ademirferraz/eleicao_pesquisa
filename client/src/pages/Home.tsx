import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Vote, UserPlus, BarChart3, Settings } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-yellow-900 flex flex-col items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">🗳️ Consulta Eleitoral</h1>
          <p className="text-xl text-yellow-200">Sistema de Votação Digital</p>
          <p className="text-sm text-gray-200 mt-2">Democracia na palma da sua mão</p>
        </div>

        {/* Main buttons grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Register Button */}
          <button
            onClick={() => setLocation("/register")}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative z-10 flex flex-col items-center gap-4">
              <UserPlus className="w-12 h-12 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">Cadastre-se</h2>
                <p className="text-blue-100 text-sm mt-1">Registre seus dados</p>
              </div>
            </div>
          </button>

          {/* Voting Button */}
          <button
            onClick={() => setLocation("/voting")}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-700 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative z-10 flex flex-col items-center gap-4">
              <Vote className="w-12 h-12 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">Votar</h2>
                <p className="text-green-100 text-sm mt-1">Escolha seu candidato</p>
              </div>
            </div>
          </button>

          {/* Results Button */}
          <button
            onClick={() => setLocation("/results")}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative z-10 flex flex-col items-center gap-4">
              <BarChart3 className="w-12 h-12 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">Resultados</h2>
                <p className="text-purple-100 text-sm mt-1">Veja os votos em tempo real</p>
              </div>
            </div>
          </button>

          {/* Admin Button */}
          <button
            onClick={() => setLocation("/admin")}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-red-700 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative z-10 flex flex-col items-center gap-4">
              <Settings className="w-12 h-12 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">Admin</h2>
                <p className="text-red-100 text-sm mt-1">Gerenciar candidatos</p>
              </div>
            </div>
          </button>
        </div>

        {/* Footer info */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 text-center text-white">
          <p className="text-sm">
            Sistema seguro e transparente para votação digital
          </p>
          <p className="text-xs text-gray-300 mt-2">
            Compartilhe este link com seus eleitores via WhatsApp, Email ou Redes Sociais
          </p>
        </div>
      </div>
    </div>
  );
}
