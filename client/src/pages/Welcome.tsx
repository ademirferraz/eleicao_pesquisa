import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { Link } from "wouter";
import { Vote, ShieldCheck, BarChart3 } from "lucide-react";

export default function Welcome() {
  return (
    <Layout>
      <div className="glass-panel rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto animate-in fade-in zoom-in duration-500">
        
        {/* Banner de Aviso */}
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mb-8 backdrop-blur-sm">
          <p className="text-yellow-200 text-sm font-medium flex items-center justify-center gap-2">
            <span className="text-lg">⚠️</span> 
            Enquete simulada para fins educativos, não oficial do TSE.
          </p>
        </div>

        {/* Ícone Principal */}
        <div className="mb-8 flex justify-center">
          <div className="bg-primary/20 p-6 rounded-full ring-4 ring-primary/30 shadow-[0_0_30px_rgba(0,255,100,0.3)]">
            <Vote className="w-16 h-16 text-primary-foreground drop-shadow-lg" />
          </div>
        </div>

        {/* Títulos */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white text-shadow tracking-tight">
          Bem-vindo à <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-yellow-400 to-blue-400">
            Consulta Eleitoral
          </span>
        </h1>
        
        <p className="text-lg text-gray-200 mb-2 font-light">
          Sistema de votação seguro e prático
        </p>
        
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-10">
          <ShieldCheck className="w-4 h-4" />
          <span>Desenvolvido pelo Matemático/Estatístico Dr. Ademir Ferraz</span>
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-4 items-center w-full max-w-xs mx-auto">
          <Link href="/cadastro" className="w-full">
            <Button className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 border-0 shadow-lg shadow-blue-900/50 transition-all hover:scale-105">
              Cadastre-se
            </Button>
          </Link>
          
          <Link href="/resultados" className="w-full">
            <Button variant="outline" className="w-full h-12 text-base font-semibold bg-white/10 border-white/30 text-white hover:bg-white/20 gap-2">
              <BarChart3 className="w-4 h-4" /> Ver Resultados
            </Button>
          </Link>
          
          <Link href="/admin-login" className="w-full">
            <Button variant="ghost" className="w-full text-gray-300 hover:text-white hover:bg-white/10">
              Administrador →
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
