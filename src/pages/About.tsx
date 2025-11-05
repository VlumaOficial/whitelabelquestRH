import { InclusiveColorGuide } from "@/components/InclusiveColorGuide";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </Link>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-gradient-diversity">
              Sobre o Quest Nós
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Uma plataforma construída com inclusão em mente, 
              onde cada cor tem significado e cada pessoa é valorizada.
            </p>
          </div>
        </div>

        <div className="space-y-12">
          <InclusiveColorGuide />
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Nossa Missão</h2>
                <p className="text-muted-foreground">
                  Criar uma plataforma de avaliação que celebra a diversidade humana 
                  em todas as suas formas. Acreditamos que cada pessoa tem potencial único 
                  e merece ser compreendida e valorizada.
                </p>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Nossos Valores</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>Inclusão:</strong> Todos são bem-vindos</li>
                  <li>• <strong>Diversidade:</strong> Celebramos as diferenças</li>
                  <li>• <strong>Acessibilidade:</strong> Design para todos</li>
                  <li>• <strong>Respeito:</strong> Dignidade em cada interação</li>
                  <li>• <strong>Empoderamento:</strong> Descobrir potenciais únicos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
