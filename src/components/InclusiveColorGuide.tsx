import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Brain, Eye, Ear, Activity, Rainbow, Sparkles, Shield, Clock } from "lucide-react";

const inclusiveColors = [
  {
    name: "Roxo/Lilás",
    hex: "#9333ea",
    groups: ["LGBTQIA+", "Igualdade de Gênero"],
    icon: Rainbow,
    description: "Representa diversidade sexual e de gênero, orgulho e igualdade."
  },
  {
    name: "Laranja",
    hex: "#ea580c", 
    groups: ["Deficiência Intelectual", "TDAH"],
    icon: Brain,
    description: "Consciência sobre deficiência intelectual e transtornos de atenção."
  },
  {
    name: "Amarelo",
    hex: "#eab308",
    groups: ["Neurodiversidade", "Deficiência Intelectual"],
    icon: Sparkles,
    description: "Celebra a neurodiversidade e diferentes formas de pensar."
  },
  {
    name: "Azul",
    hex: "#3b82f6",
    groups: ["Autismo", "Deficiência Auditiva"],
    icon: Ear,
    description: "Consciência sobre autismo e deficiência auditiva."
  },
  {
    name: "Verde",
    hex: "#22c55e",
    groups: ["Saúde Mental", "Bem-estar"],
    icon: Heart,
    description: "Representa saúde mental, bem-estar e crescimento pessoal."
  },
  {
    name: "Rosa",
    hex: "#ec4899",
    groups: ["Empoderamento Feminino", "Câncer de Mama"],
    icon: Heart,
    description: "Empoderamento feminino e consciência sobre câncer de mama."
  },
  {
    name: "Turquesa",
    hex: "#06b6d4",
    groups: ["Síndrome de Tourette", "Ansiedade"],
    icon: Shield,
    description: "Consciência sobre Síndrome de Tourette e transtornos de ansiedade."
  },
  {
    name: "Vermelho",
    hex: "#dc2626",
    groups: ["HIV/AIDS", "Deficiência Física"],
    icon: Activity,
    description: "Consciência sobre HIV/AIDS e deficiência física."
  },
  {
    name: "Prata/Cinza",
    hex: "#6b7280",
    groups: ["Idosos", "Envelhecimento Ativo"],
    icon: Clock,
    description: "Representa sabedoria dos idosos e envelhecimento ativo."
  },
  {
    name: "Dourado",
    hex: "#f59e0b",
    groups: ["Deficiência Visual", "Conquistas"],
    icon: Eye,
    description: "Consciência sobre deficiência visual e celebração de conquistas."
  }
];

export function InclusiveColorGuide() {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gradient-diversity">
          Paleta de Cores Inclusivas
        </CardTitle>
        <CardDescription>
          Cada cor representa diferentes grupos e causas de inclusão, 
          criando um design verdadeiramente diverso e acolhedor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inclusiveColors.map((color, index) => {
            const IconComponent = color.icon;
            return (
              <div 
                key={index}
                className="p-4 rounded-lg border border-border/50 hover:border-border transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: color.hex }}
                  >
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{color.name}</h3>
                    <p className="text-xs text-muted-foreground">{color.hex}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {color.groups.map((group, groupIndex) => (
                      <Badge 
                        key={groupIndex}
                        variant="secondary" 
                        className="text-xs px-2 py-1"
                        style={{ 
                          backgroundColor: `${color.hex}20`,
                          color: color.hex,
                          borderColor: `${color.hex}40`
                        }}
                      >
                        {group}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {color.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Quest Nós</strong> abraça a diversidade em todas as suas formas. 
            Cada cor em nossa paleta conta uma história de inclusão, respeito e celebração das diferenças humanas.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
