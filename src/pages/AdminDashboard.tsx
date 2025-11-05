import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  useAllCandidates, 
  useSystemStats, 
  useSubjectPerformanceReport,
  useDatabaseHealth,
  useCandidateAssessments
} from "@/hooks/useSupabase";
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Award, 
  AlertCircle,
  CheckCircle,
  BarChart3,
  Eye,
  Clock,
  Target,
  X,
  Mail,
  Phone,
  GraduationCap,
  Calendar
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function AdminDashboard() {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  
  // Queries
  const { data: candidates, isLoading: loadingCandidates } = useAllCandidates();
  const { data: stats, isLoading: loadingStats } = useSystemStats();
  const { data: subjectPerformance, isLoading: loadingSubjects } = useSubjectPerformanceReport();
  const { data: dbHealth } = useDatabaseHealth();
  const { data: candidateAssessments, isLoading: loadingAssessments } = useCandidateAssessments(selectedCandidate || '');

  // Encontrar candidato selecionado
  const selectedCandidateData = candidates?.find(c => c.id === selectedCandidate);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gradient-diversity">
                Dashboard Administrativo
              </h1>
              <p className="text-muted-foreground mt-2">
                Insights e análises dos candidatos e avaliações
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {dbHealth ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Sistema Online
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Sistema Offline
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Candidatos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingStats ? '...' : stats?.total_candidates || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Registros na plataforma
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliações Realizadas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingStats ? '...' : stats?.total_assessments || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Total de questionários
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingStats ? '...' : `${stats?.completion_rate || 0}%`}
              </div>
              <p className="text-xs text-muted-foreground">
                Avaliações completadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliações Completas</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingStats ? '...' : stats?.completed_assessments || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Finalizadas com sucesso
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="candidates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="candidates">Candidatos</TabsTrigger>
            <TabsTrigger value="performance">Desempenho por Matéria</TabsTrigger>
            <TabsTrigger value="insights">Insights Avançados</TabsTrigger>
          </TabsList>

          {/* Candidatos Tab */}
          <TabsContent value="candidates">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Lista de Candidatos
                </CardTitle>
                <CardDescription>
                  Visualize todos os candidatos e suas avaliações
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingCandidates ? (
                  <div className="text-center py-8">Carregando candidatos...</div>
                ) : (
                  <div className="space-y-4">
                    {candidates?.map((candidate) => (
                      <div 
                        key={candidate.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div>
                              <h3 className="font-semibold">{candidate.full_name}</h3>
                              <p className="text-sm text-muted-foreground">{candidate.email}</p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(candidate.registration_date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {candidate.total_assessments} avaliações
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {candidate.completed_assessments} completas
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {candidate.avg_score && candidate.avg_score > 0 ? (
                            <Badge className={getScoreColor(candidate.avg_score)}>
                              {candidate.avg_score.toFixed(1)}%
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              Sem avaliações
                            </Badge>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedCandidate(candidate.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {candidates?.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhum candidato encontrado
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance por Matéria Tab */}
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Desempenho por Matéria
                </CardTitle>
                <CardDescription>
                  Análise do desempenho dos candidatos em cada área de avaliação
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingSubjects ? (
                  <div className="text-center py-8">Carregando dados de desempenho...</div>
                ) : (
                  <div className="space-y-4">
                    {subjectPerformance?.map((subject) => (
                      <div 
                        key={subject.subject_name}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{subject.subject_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {subject.subject_description}
                            </p>
                          </div>
                          <Badge className={getScoreColor(subject.success_rate_percentage)}>
                            {subject.success_rate_percentage}% de acerto
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Total de Respostas:</span>
                            <div className="font-semibold">{subject.total_answers}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Respostas Corretas:</span>
                            <div className="font-semibold text-green-600">
                              {subject.correct_answers}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Pontuação Média:</span>
                            <div className="font-semibold">
                              {subject.avg_score?.toFixed(1) || 'N/A'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Barra de progresso visual */}
                        <div className="mt-3">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${subject.success_rate_percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {subjectPerformance?.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhum dado de desempenho disponível
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Insights Avançados
                  </CardTitle>
                  <CardDescription>
                    Análises detalhadas e tendências do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Resumo Geral */}
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h3 className="font-semibold mb-2">📊 Resumo Geral</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Candidatos Ativos</div>
                          <div className="font-bold text-lg">{stats?.total_candidates || 0}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Taxa de Sucesso</div>
                          <div className="font-bold text-lg text-green-600">
                            {stats?.completion_rate || 0}%
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Avaliações/Dia</div>
                          <div className="font-bold text-lg">
                            {Math.round((stats?.total_assessments || 0) / 30)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Eficiência</div>
                          <div className="font-bold text-lg text-blue-600">Alta</div>
                        </div>
                      </div>
                    </div>

                    {/* Recomendações */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h3 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">
                        💡 Recomendações
                      </h3>
                      <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                        <li>• Considere adicionar mais questões nas matérias com menor taxa de acerto</li>
                        <li>• Implemente feedback personalizado baseado no desempenho por matéria</li>
                        <li>• Crie relatórios automáticos semanais para acompanhar tendências</li>
                        <li>• Desenvolva um sistema de badges para motivar os candidatos</li>
                      </ul>
                    </div>

                    {/* Status do Sistema */}
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h3 className="font-semibold mb-2 text-green-800 dark:text-green-200">
                        ✅ Status do Sistema
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Banco de dados operacional</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>APIs funcionando normalmente</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Backup automático ativo</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Monitoramento em tempo real</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal de Detalhes do Candidato */}
      <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Detalhes do Candidato
            </DialogTitle>
            <DialogDescription>
              Informações completas e histórico de avaliações
            </DialogDescription>
          </DialogHeader>

          {selectedCandidateData && (
            <div className="space-y-6">
              {/* Informações Pessoais */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Nome:</span>
                        <span>{selectedCandidateData.full_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Email:</span>
                        <span>{selectedCandidateData.email}</span>
                      </div>
                      {selectedCandidateData.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Telefone:</span>
                          <span>{selectedCandidateData.phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      {selectedCandidateData.education_level && (
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Escolaridade:</span>
                          <span>{selectedCandidateData.education_level}</span>
                        </div>
                      )}
                      {selectedCandidateData.experience_years !== undefined && (
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Experiência:</span>
                          <span>{selectedCandidateData.experience_years} anos</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Cadastro:</span>
                        <span>{formatDate(selectedCandidateData.registration_date)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedCandidateData.total_assessments}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total de Avaliações
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedCandidateData.completed_assessments}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Avaliações Completas
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedCandidateData.avg_score ? selectedCandidateData.avg_score.toFixed(1) : '0'}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Pontuação Média
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Histórico de Avaliações */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Histórico de Avaliações</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingAssessments ? (
                    <div className="text-center py-8">Carregando avaliações...</div>
                  ) : candidateAssessments && candidateAssessments.length > 0 ? (
                    <div className="space-y-3">
                      {candidateAssessments.map((assessment) => (
                        <div 
                          key={assessment.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <div className="font-medium">
                              Avaliação #{assessment.id.slice(0, 8)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Iniciada em: {formatDate(assessment.started_at)}
                            </div>
                            {assessment.completed_at && (
                              <div className="text-sm text-muted-foreground">
                                Finalizada em: {formatDate(assessment.completed_at)}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={assessment.status === 'completed' ? 'default' : 'secondary'}
                            >
                              {assessment.status === 'completed' ? 'Completa' : 'Em Andamento'}
                            </Badge>
                            {assessment.percentage_score && (
                              <Badge className={getScoreColor(assessment.percentage_score)}>
                                {assessment.percentage_score.toFixed(1)}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma avaliação encontrada
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
