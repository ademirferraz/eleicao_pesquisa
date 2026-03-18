import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { ArrowLeft, LogOut, Lock } from "lucide-react";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === "1234") {
      toast({
        title: "Acesso Permitido",
        description: "Bem-vindo ao painel administrativo.",
        className: "bg-green-600 text-white border-none"
      });
      setLocation("/admin-panel");
    } else {
      toast({
        title: "Acesso Negado",
        description: "Senha incorreta.",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="glass-panel rounded-3xl p-8 md:p-12 w-full max-w-md mx-auto animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" onClick={() => setLocation("/")} className="text-white hover:bg-white/10 gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          <Button variant="destructive" onClick={() => setLocation("/")} className="gap-2 bg-red-500/80 hover:bg-red-600">
            <LogOut className="w-4 h-4" /> Sair
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-white/20">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Acesso Administrativo</h2>
          <p className="text-gray-300 text-sm mt-2">Área restrita para gestão do sistema</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha de administrador" 
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12 text-center text-lg tracking-widest"
              autoFocus
            />
          </div>

          <Button type="submit" className="w-full h-12 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-0 shadow-lg">
            Entrar
          </Button>
        </form>
      </div>
    </Layout>
  );
}
