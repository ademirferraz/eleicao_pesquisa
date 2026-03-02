import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export default function Layout({ children, className = "" }: LayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col items-center justify-start md:justify-center py-6 md:py-8 px-4 md:px-8 ${className}`}>
      <div className="w-full max-w-4xl mx-auto relative z-10">
        {children}
      </div>
      
      {/* Overlay para garantir legibilidade sobre o background */}
      <div className="fixed inset-0 bg-black/30 pointer-events-none z-0" />
    </div>
  );
}
