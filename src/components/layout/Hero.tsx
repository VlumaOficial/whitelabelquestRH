import { ArrowRight, Sparkles, Users, Target, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeroProps {
  onStartJourney: () => void;
}

export function Hero({ onStartJourney }: HeroProps) {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-orange-50/30 dark:from-purple-950/20 dark:via-blue-950/10 dark:to-orange-950/10" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-orange-200/20 rounded-full blur-3xl animate-pulse delay-500" />

      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="flex justify-center">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border-purple-200 dark:from-purple-900/30 dark:to-blue-900/30 dark:text-purple-300 dark:border-purple-700">
              <Sparkles className="w-4 h-4 mr-2" />
              Plataforma Inclusiva de Avaliação
            </Badge>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              <span className="text-gradient-diversity">
                Descubra seu
              </span>
              <br />
              <span className="text-foreground">potencial único</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Uma jornada personalizada para identificar suas habilidades, 
              respeitando sua individualidade e promovendo a <span className="text-gradient-rainbow font-semibold">inclusão</span> de todos.
            </p>
          </div>

          {/* Features - Representando Diversos Grupos */}
          <div className="flex flex-wrap justify-center gap-4 py-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-medium">LGBTQIA+</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium">Neurodiversidade</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-sm font-medium">Deficiências</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm font-medium">Saúde Mental</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <span className="text-sm font-medium">Idosos</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-pink-600 dark:text-pink-400" />
              </div>
              <span className="text-sm font-medium">Mulheres</span>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <Button 
              onClick={onStartJourney}
              size="lg" 
              className="bg-gradient-to-r from-purple-600 via-pink-500 via-blue-500 to-green-500 hover:from-purple-700 hover:via-pink-600 hover:via-blue-600 hover:to-green-600 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Iniciar Minha Jornada
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-sm text-muted-foreground">
              ✨ Gratuito • 🔒 Seguro • 🌍 Acessível
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
