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
  Calendar,
  RotateCcw
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import AssessmentAnswersModal from "@/components/AssessmentAnswersModal";
import SubjectPerformanceModule from "@/components/SubjectPerformanceModule";
import CandidateCombobox from "@/components/CandidateCombobox";
import { calculateAllSubjectsPerformance } from "@/utils/performanceCalculations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'completed' | 'incomplete' | 'retakes'>('all');
  const [selectedCandidateForPerformance, setSelectedCandidateForPerformance] = useState<string | null>(null);
  
  // Queries
  const { data: candidates, isLoading: loadingCandidates } = useAllCandidates();
  const { data: stats, isLoading: loadingStats } = useSystemStats();
  const { data: subjectPerformance, isLoading: loadingSubjects } = useSubjectPerformanceReport();
  const { data: dbHealth } = useDatabaseHealth();
  const { data: candidateAssessments, isLoading: loadingAssessments } = useCandidateAssessments(selectedCandidate || '');
  
  // Query para buscar assessments do candidato selecionado para performance
  const { data: performanceCandidateAssessments } = useCandidateAssessments(selectedCandidateForPerformance || '');

  // Query para buscar todas as respostas dos assessments
  const { data: allAnswers, isLoading: loadingAnswers } = useQuery({
    queryKey: ['all-assessment-answers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessment_answers')
        .select('*')
        .order('question_number');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Calcular desempenho por matéria
  const subjectsPerformanceData = allAnswers ? calculateAllSubjectsPerformance(allAnswers) : [];
  
  // Filtrar por candidato se selecionado
  const filteredAnswers = selectedCandidateForPerformance && allAnswers
    ? allAnswers.filter(a => {
        // Buscar assessment_id do candidato selecionado para performance
        const candidateAssessmentIds = performanceCandidateAssessments?.map(ca => ca.id) || [];
        return candidateAssessmentIds.includes(a.assessment_id);
      })
    : allAnswers || [];
  
  const filteredSubjectsPerformance = filteredAnswers.length > 0 
    ? calculateAllSubjectsPerformance(filteredAnswers)
    : [];

  // Encontrar candidato selecionado
  const selectedCandidateData = candidates?.find(c => c.id === selectedCandidate);
  const selectedCandidateForPerformanceData = candidates?.find(c => c.id === selectedCandidateForPerformance);

  // Calcular estatísticas detalhadas
  const candidatesWithCompleted = candidates?.filter(c => c.completed_assessments > 0) || [];
  const candidatesWithIncomplete = candidates?.filter(c => c.total_assessments > c.completed_assessments) || [];
  const candidatesWithRetakes = candidates?.filter(c => c.assessment_count > 1) || [];
  
  // Filtrar candidatos baseado no filtro ativo
  const filteredCandidates = candidates?.filter(candidate => {
    switch (activeFilter) {
      case 'completed':
        return candidate.completed_assessments > 0;
      case 'incomplete':
        return candidate.total_assessments > candidate.completed_assessments;
      case 'retakes':
        return candidate.assessment_count > 1;
      default:
        return true;
    }
  }) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para converter média das respostas em classificação por nível
  const getClassification = (avgScore: number) => {
    // Nova classificação baseada na média das respostas (1-5)
    if (avgScore >= 5.0) return { level: 5, label: "Nível 5 - Especialista", color: "bg-purple-100 text-purple-800 border-purple-200" };
    if (avgScore >= 4.0) return { level: 4, label: "Nível 4 - Avançado", color: "bg-green-100 text-green-800 border-green-200" };
    if (avgScore >= 3.0) return { level: 3, label: "Nível 3 - Intermediário", color: "bg-blue-100 text-blue-800 border-blue-200" };
    if (avgScore >= 2.0) return { level: 2, label: "Nível 2 - Básico", color: "bg-yellow-100 text-yellow-800 border-yellow-200" };
    return { level: 1, label: "Nível 1 - Iniciante", color: "bg-red-100 text-red-800 border-red-200" };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 60) return "bg-blue-100 text-blue-800 border-blue-200";
    if (score >= 40) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
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

        {/* Stats Cards - Clicáveis */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${activeFilter === 'all' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Candidatos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {loadingCandidates ? '...' : candidates?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Clique para ver todos
              </p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${activeFilter === 'completed' ? 'ring-2 ring-green-500' : ''}`}
            onClick={() => setActiveFilter('completed')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Questionários Completos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {loadingCandidates ? '...' : candidatesWithCompleted.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Clique para filtrar
              </p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${activeFilter === 'retakes' ? 'ring-2 ring-orange-500' : ''}`}
            onClick={() => setActiveFilter('retakes')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Questionários Refeitos</CardTitle>
              <RotateCcw className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {loadingCandidates ? '...' : candidatesWithRetakes.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Clique para filtrar
              </p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${activeFilter === 'incomplete' ? 'ring-2 ring-red-500' : ''}`}
            onClick={() => setActiveFilter('incomplete')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Questionários Incompletos</CardTitle>
              <Clock className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {loadingCandidates ? '...' : candidatesWithIncomplete.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Clique para filtrar
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">% de Conclusão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {loadingStats ? '...' : `${stats?.completion_rate || 0}%`}
              </div>
              <p className="text-xs text-muted-foreground">
                Taxa geral de sucesso
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
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Lista de Candidatos
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {filteredCandidates.length} de {candidates?.length || 0}
                    </Badge>
                    {activeFilter !== 'all' && (
                      <Badge 
                        variant="secondary" 
                        className="text-xs cursor-pointer"
                        onClick={() => setActiveFilter('all')}
                      >
                        {activeFilter === 'completed' && '✅ Completos'}
                        {activeFilter === 'incomplete' && '⏳ Incompletos'}
                        {activeFilter === 'retakes' && '🔄 Refeitos'}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    )}
                  </div>
                </CardTitle>
                <CardDescription>
                  {activeFilter === 'all' && 'Visualize todos os candidatos e suas avaliações'}
                  {activeFilter === 'completed' && 'Candidatos com questionários completos'}
                  {activeFilter === 'incomplete' && 'Candidatos com questionários pendentes'}
                  {activeFilter === 'retakes' && 'Candidatos que refizeram questionários'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingCandidates ? (
                  <div className="text-center py-8">Carregando candidatos...</div>
                ) : (
                  <div className="space-y-4">
                    {filteredCandidates?.map((candidate) => (
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
                          <div className="flex flex-col items-end gap-1">
                            {candidate.avg_score && candidate.avg_score > 0 ? (
                              <>
                                <Badge className={getClassification(candidate.avg_score).color}>
                                  Nível {getClassification(candidate.avg_score).level}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {getClassification(candidate.avg_score).label}
                                </span>
                              </>
                            ) : (
                              <Badge variant="secondary">
                                Sem mapeamentos
                              </Badge>
                            )}
                            {/* Badge Novo/Refeito */}
                            <div className="flex gap-1 mt-1">
                              <Badge 
                                variant="outline"
                                className="text-xs bg-green-100 text-green-800 border-green-200"
                              >
                                {candidate.assessment_count > 1 ? `${candidate.assessment_count - 1} Refeito(s)` : 'Novo'}
                              </Badge>
                            </div>
                          </div>
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
            <div className="space-y-4">
              {/* Seletor de Candidato com Pesquisa */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Selecionar Candidato</CardTitle>
                  <CardDescription>
                    Escolha um candidato para ver o desempenho individual ou visualize todos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CandidateCombobox
                    candidates={candidates || []}
                    selectedCandidateId={selectedCandidateForPerformance}
                    onSelectCandidate={setSelectedCandidateForPerformance}
                  />
                </CardContent>
              </Card>

              {/* Módulo de Desempenho */}
              {loadingAnswers ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      Carregando dados de desempenho...
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <SubjectPerformanceModule
                  subjectsPerformance={selectedCandidateForPerformance ? filteredSubjectsPerformance : subjectsPerformanceData}
                  candidateName={selectedCandidateForPerformanceData?.full_name}
                />
              )}
            </div>
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
                        Nível {selectedCandidateData.avg_score ? getClassification(selectedCandidateData.avg_score).level : '0'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedCandidateData.avg_score ? getClassification(selectedCandidateData.avg_score).label : 'Sem classificação'}
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
                              Mapeamento #{assessment.id.slice(0, 8)}
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
                            <Badge 
                              variant={assessment.is_retake ? 'destructive' : 'outline'}
                              className={assessment.is_retake ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-green-100 text-green-800 border-green-200'}
                            >
                              {assessment.is_retake ? 'Refeito' : 'Novo'}
                            </Badge>
                            {assessment.percentage_score && (
                              <Badge className={getClassification(assessment.percentage_score).color}>
                                Nível {getClassification(assessment.percentage_score).level}
                              </Badge>
                            )}
                            {assessment.status === 'completed' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedAssessment(assessment.id)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Ver Respostas
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum mapeamento encontrado
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Visualização de Respostas */}
      <AssessmentAnswersModal 
        assessmentId={selectedAssessment}
        onClose={() => setSelectedAssessment(null)}
      />

      <Footer />
    </div>
  );
}
