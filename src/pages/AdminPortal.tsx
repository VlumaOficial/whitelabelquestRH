import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Settings, 
  FileText, 
  BarChart3, 
  Palette,
  Shield,
  LogOut,
  ArrowRight,
  CheckCircle,
  Clock,
  Target,
  Award,
  TrendingUp
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useClientConfig } from "@/config/client";

export default function AdminPortal() {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const config = useClientConfig();

  const adminModules = [
    {
      id: 'dashboard',
      title: 'Dashboard Analítico',
      description: 'Visão completa dos candidatos, avaliações e estatísticas do sistema',
      icon: BarChart3,
      color: 'from-blue-600 to-blue-700',
      route: '/admin/dashboard',
      features: ['Estatísticas em tempo real', 'Análise de performance', 'Relatórios detalhados']
    },
    {
      id: 'branding',
      title: 'Configurações de Marca',
      description: 'Personalize a identidade visual e configurações da plataforma',
      icon: Palette,
      color: 'from-purple-600 to-purple-700',
      route: '/admin/branding',
      features: ['Cores personalizadas', 'Logo da empresa', 'Textos e políticas']
    },
    {
      id: 'questionnaire',
      title: 'Gestão de Questionários',
      description: 'Crie e gerencie questionários de avaliação de competências',
      icon: FileText,
      color: 'from-green-600 to-green-700',
      route: '/admin/questionnaire',
      features: ['Criação de questões', 'Categorias por matéria', 'Análise de respostas']
    }
  ];

  const quickStats = [
    {
      label: 'Candidatos Ativos',
      value: '156',
      icon: Users,
      trend: '+12%'
    },
    {
      label: 'Avaliações Completas',
      value: '89',
      icon: CheckCircle,
      trend: '+8%'
    },
    {
      label: 'Taxa de Conclusão',
      value: '94%',
      icon: Target,
      trend: '+5%'
    },
    {
      label: 'Média Geral',
      value: '8.2',
      icon: Award,
      trend: '+0.3'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header do Portal */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-blue-600 to-orange-500 bg-clip-text text-transparent">
                Portal Administrativo
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                {config.company.name} - Sistema de Gestão de Talentos
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Informações do Usuário */}
              {user && (
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-600 via-blue-600 to-orange-500 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{user.full_name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? 'Administrador' : 'Consulta'}
                        </Badge>
                        <span>•</span>
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
              
              {/* Botão de Logout */}
              <Button
                variant="outline"
                onClick={logout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <Badge variant="secondary" className="text-green-600">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {stat.trend}
                    </Badge>
                  </div>
                </div>
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Módulos Administrativos */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Módulos do Sistema</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {adminModules.map((module) => (
              <Card 
                key={module.id} 
                className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 hover:border-orange-200"
                onClick={() => navigate(module.route)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 bg-gradient-to-br ${module.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <module.icon className="w-6 h-6 text-white" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-orange-600 transition-colors" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-orange-600 transition-colors">
                    {module.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {module.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full mt-4 bg-gradient-to-r from-orange-600 via-blue-600 to-orange-500 hover:from-orange-700 hover:via-blue-700 hover:to-orange-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(module.route);
                    }}
                  >
                    Acessar Módulo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Acesso Rápido */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Acesso Rápido</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="h-16 flex-col gap-2"
              onClick={() => navigate('/admin/dashboard')}
            >
              <BarChart3 className="w-6 h-6" />
              <span className="text-sm">Ver Relatórios</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex-col gap-2"
              onClick={() => navigate('/admin/branding')}
            >
              <Palette className="w-6 h-6" />
              <span className="text-sm">Configurar Marca</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex-col gap-2"
              onClick={() => navigate('/admin/questionnaire')}
            >
              <FileText className="w-6 h-6" />
              <span className="text-sm">Criar Questionário</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex-col gap-2"
              onClick={() => navigate('/admin/dashboard')}
            >
              <Users className="w-6 h-6" />
              <span className="text-sm">Gerenciar Candidatos</span>
            </Button>
          </div>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}
