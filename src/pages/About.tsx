import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Target, 
  Eye, 
  Heart, 
  Users, 
  Sparkles, 
  Shield, 
  Lightbulb,
  Palette,
  MessageSquare,
  Code,
  MapPin,
  Mail,
  Phone
} from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link to="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </Link>
          
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Sobre a NÓS
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Somos uma agência de branding e comunicação que acredita no poder da diversidade e da inclusão.
            </p>
          </div>
        </div>

        {/* Missão, Visão e Valores */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Nossa Missão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Conectar marcas e pessoas através de estratégias autênticas, criativas e inclusivas.
                Acreditamos que a comunicação verdadeira nasce da representatividade e do respeito às diferenças.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Nossa Visão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Ser referência em comunicação inclusiva, transformando o mercado através de projetos que celebram a diversidade em todas as suas formas.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Nossos Valores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Users className="w-4 h-4 mt-0.5 text-purple-600 flex-shrink-0" />
                  <span><strong>Inclusão</strong> - Todos são bem-vindos e representados</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span><strong>Diversidade</strong> - Celebramos as diferenças como força</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span><strong>Autenticidade</strong> - Comunicação verdadeira</span>
                </li>
                <li className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 mt-0.5 text-yellow-600 flex-shrink-0" />
                  <span><strong>Criatividade</strong> - Soluções inovadoras</span>
                </li>
                <li className="flex items-start gap-2">
                  <Heart className="w-4 h-4 mt-0.5 text-red-500 flex-shrink-0" />
                  <span><strong>Respeito</strong> - Dignidade em cada interação</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 mt-0.5 text-purple-600 flex-shrink-0" />
                  <span><strong>Propósito</strong> - Trabalho com impacto social</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* O que fazemos */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">🌈 O que fazemos</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-600" />
                  Branding & Estratégia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Construímos marcas autênticas que conectam com pessoas reais
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Identidade Visual</li>
                  <li>• Posicionamento de Marca</li>
                  <li>• Estratégia de Comunicação</li>
                  <li>• Rebranding</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Conteúdo & Criação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Produzimos conteúdo que representa e engaja
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Copywriting</li>
                  <li>• Design Gráfico</li>
                  <li>• Gestão de Redes Sociais</li>
                  <li>• Produção de Vídeo</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-green-600" />
                  Digital & Tecnologia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Desenvolvemos soluções digitais acessíveis e inclusivas
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Websites e Landing Pages</li>
                  <li>• Automação de Processos</li>
                  <li>• Experiência do Usuário (UX/UI)</li>
                  <li>• Estratégia Digital</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Por que somos diferentes */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">🤝 Por que somos diferentes</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Diversidade Real</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Nossa equipe reflete a diversidade que defendemos. Pessoas de diferentes origens, identidades e experiências trabalhando juntas.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Inclusão na Prática</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Não falamos apenas sobre inclusão - vivemos ela. Desde processos seletivos até entregas finais, a acessibilidade e representatividade guiam nossas decisões.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Impacto Social</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Cada projeto é uma oportunidade de transformação. Trabalhamos com marcas que compartilham nosso compromisso com um mundo mais justo e inclusivo.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Qualidade e Criatividade</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Inclusão não significa abrir mão da excelência. Entregamos trabalhos criativos, estratégicos e de alta qualidade.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Nosso Time */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">🌟 Nosso Time</h2>
          <p className="text-muted-foreground">
            Profissionais diversos, talentosos e apaixonados por fazer a diferença.
            Designers, redatores, estrategistas, desenvolvedores e consultores de diversidade trabalhando em sinergia.
          </p>
        </div>

        {/* Contato */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
            <CardHeader>
              <CardTitle className="text-2xl text-center">💬 Vamos conversar?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                Tem um projeto em mente? Quer fazer parte do nosso time?
                Entre em contato e vamos construir algo incrível juntos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">São Paulo, Brasil</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">contato@questnos.com</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">(11) 0000-0000</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
