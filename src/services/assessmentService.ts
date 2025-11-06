import { supabase } from "@/lib/supabase";
import type { 
  Candidate, 
  Assessment, 
  AssessmentAnswer, 
  Subject,
  CandidateFormData, 
  AssessmentSubmission,
  CandidateSummary,
  SubjectPerformance,
  AssessmentDetailedReport,
  PersonalPresentationData
} from "@/types/database";

export class AssessmentService {
  
  // ============================================
  // UTILITÁRIOS
  // ============================================
  
  /**
   * Retry automático para operações que podem falhar por conexão
   */
  private static async retryOperation<T>(
    operation: () => Promise<T>, 
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        const isConnectionError = error.message?.includes('ERR_CONNECTION_CLOSED') || 
                                 error.message?.includes('network') ||
                                 error.code === 'PGRST301';
        
        if (attempt === maxRetries || !isConnectionError) {
          throw error;
        }
        
        console.warn(`Tentativa ${attempt} falhou, tentando novamente em ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Backoff exponencial
      }
    }
    throw new Error('Máximo de tentativas excedido');
  }
  
  // ============================================
  // CANDIDATOS
  // ============================================
  
  /**
   * Criar novo candidato ou buscar existente
   */
  static async createCandidate(candidateData: CandidateFormData): Promise<Candidate> {
    // Adicionar timestamps de aceite de termos
    const now = new Date().toISOString();
    const dataWithTimestamps = {
      ...candidateData,
      terms_accepted_at: candidateData.terms_accepted ? now : null,
      privacy_policy_accepted_at: candidateData.privacy_policy_accepted ? now : null,
    };

    // Primeiro, tentar buscar candidato existente pelo email
    const existingCandidate = await this.getCandidateByEmail(candidateData.email);
    
    if (existingCandidate) {
      // Se já existe, atualizar os dados (incluindo novo aceite de termos se aplicável)
      const { data: updatedCandidate, error: updateError } = await supabase
        .from('candidates')
        .update(dataWithTimestamps)
        .eq('id', existingCandidate.id)
        .select();

      if (updateError) {
        console.error('Erro ao atualizar candidato:', updateError);
        throw new Error(`Erro ao atualizar candidato: ${updateError.message}`);
      }

      return updatedCandidate?.[0] || existingCandidate;
    }

    // Se não existe, criar novo
    const { data, error } = await supabase
      .from('candidates')
      .insert([dataWithTimestamps])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar candidato:', error);
      throw new Error(`Erro ao criar candidato: ${error.message}`);
    }

    return data;
  }

  /**
   * Buscar candidato por email
   */
  static async getCandidateByEmail(email: string): Promise<Candidate | null> {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Erro ao buscar candidato:', error);
      throw new Error(`Erro ao buscar candidato: ${error.message}`);
    }

    return data;
  }

  /**
   * Salvar apresentação pessoal do candidato
   */
  static async savePersonalPresentation(candidateId: string, presentationData: PersonalPresentationData): Promise<Candidate> {
    const updateData = {
      ...presentationData,
      presentation_completed_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('candidates')
      .update(updateData)
      .eq('id', candidateId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar apresentação pessoal:', error);
      throw new Error(`Erro ao salvar apresentação pessoal: ${error.message}`);
    }

    return data;
  }

  /**
   * Listar todos os candidatos (apenas admin) com fallback
   */
  static async getAllCandidates(): Promise<CandidateSummary[]> {
    return this.retryOperation(async () => {
      // Tentar usar a view primeiro
      const { data, error } = await supabase
        .from('candidate_summary')
        .select('*')
        .order('registration_date', { ascending: false });

      if (error) {
        console.warn('View candidate_summary não encontrada, usando consulta direta:', error.message);
        
        // Fallback: consulta direta nas tabelas
        const { data: candidatesData, error: candidatesError } = await supabase
          .from('candidates')
          .select(`
            id,
            full_name,
            email,
            phone,
            education_level,
            experience_years,
            created_at
          `)
          .order('created_at', { ascending: false });

        if (candidatesError) {
          throw new Error(`Erro ao listar candidatos: ${candidatesError.message}`);
        }

        // Transformar dados para o formato esperado
        return (candidatesData || []).map(candidate => ({
          ...candidate,
          registration_date: candidate.created_at,
          total_assessments: 0,
          completed_assessments: 0,
          avg_score: 0,
          last_assessment_date: null
        }));
      }

      return data || [];
    });
  }

  // ============================================
  // MATÉRIAS
  // ============================================
  
  /**
   * Buscar matérias ativas (com retry automático)
   */
  static async getActiveSubjects(): Promise<Subject[]> {
    return this.retryOperation(async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Erro ao buscar matérias:', error);
        throw new Error(`Erro ao buscar matérias: ${error.message}`);
      }

      return data || [];
    });
  }

  // ============================================
  // AVALIAÇÕES
  // ============================================
  
  /**
   * Iniciar nova avaliação
   */
  static async startAssessment(candidateId: string): Promise<Assessment> {
    const assessmentData = {
      candidate_id: candidateId,
      status: 'in_progress' as const,
      ip_address: await this.getClientIP(),
      user_agent: navigator.userAgent
    };

    const { data, error } = await supabase
      .from('assessments')
      .insert([assessmentData])
      .select()
      .single();

    if (error) {
      console.error('Erro ao iniciar avaliação:', error);
      throw new Error(`Erro ao iniciar avaliação: ${error.message}`);
    }

    return data;
  }

  /**
   * Salvar respostas e finalizar avaliação
   */
  static async submitAssessment(submission: AssessmentSubmission): Promise<Assessment> {
    try {
      // 1. Iniciar transação - criar avaliação
      const assessment = await this.startAssessment(submission.candidate_id);

      // 2. Salvar todas as respostas
      const answersToInsert = submission.answers.map(answer => ({
        assessment_id: assessment.id,
        subject_id: answer.subject_id,
        question_number: answer.question_number,
        question_text: answer.question_text,
        answer_value: answer.answer_value,
        answer_score: answer.answer_score || 0,
        is_correct: answer.is_correct || false,
        time_spent_seconds: answer.time_spent_seconds || 0
      }));

      const { error: answersError } = await supabase
        .from('assessment_answers')
        .insert(answersToInsert);

      if (answersError) {
        throw new Error(`Erro ao salvar respostas: ${answersError.message}`);
      }

      // 3. Calcular scores usando a função do banco
      const { data: scoreData, error: scoreError } = await supabase
        .rpc('calculate_assessment_score', { assessment_uuid: assessment.id });

      if (scoreError) {
        console.error('Erro ao calcular score:', scoreError);
      }

      const totalScore = scoreData?.[0]?.total_score || 0;
      const percentageScore = scoreData?.[0]?.percentage_score || 0;

      // 4. Atualizar avaliação com scores e status completo
      
      const { data: updatedAssessment, error: updateError } = await supabase
        .from('assessments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          total_score: totalScore,
          percentage_score: percentageScore,
          time_spent_minutes: submission.time_spent_minutes
        })
        .eq('id', assessment.id)
        .select();

      if (updateError) {
        throw new Error(`Erro ao finalizar avaliação: ${updateError.message}`);
      }
      return updatedAssessment?.[0] || assessment;

    } catch (error) {
      console.error('Erro ao submeter avaliação:', error);
      throw error;
    }
  }

  /**
   * Buscar avaliações de um candidato
   */
  static async getCandidateAssessments(candidateId: string): Promise<Assessment[]> {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar avaliações do candidato:', error);
      throw new Error(`Erro ao buscar avaliações: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Buscar respostas de um assessment específico
   */
  static async getAssessmentAnswers(assessmentId: string) {
    console.log('🔧 DEBUG - Buscando respostas para assessment:', assessmentId);
    
    // Primeiro, verificar se o assessment existe
    const { data: assessment } = await supabase
      .from('assessments')
      .select('id, status, completed_at, candidate_id')
      .eq('id', assessmentId)
      .single();
    
    console.log('🔧 DEBUG - Assessment encontrado:', assessment);
    
    if (!assessment) {
      throw new Error('Assessment não encontrado');
    }
    
    // Buscar todas as respostas do questionário
    const { data: answers, error } = await supabase
      .from('assessment_answers')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('question_number', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar respostas do assessment:', error);
      throw new Error(`Erro ao buscar respostas: ${error.message}`);
    }

    console.log('🔧 DEBUG - Respostas do questionário encontradas:', answers?.length || 0);
    
    // Buscar dados pessoais do candidato
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select(`
        personal_presentation,
        additional_skills,
        highlighted_soft_skills,
        relevant_experiences,
        professional_goals,
        linkedin_url,
        portfolio_url,
        github_url,
        behance_url,
        instagram_url
      `)
      .eq('id', assessment.candidate_id)
      .single();

    if (candidateError) {
      console.warn('⚠️ Erro ao buscar dados pessoais:', candidateError);
    }

    console.log('🔧 DEBUG - Dados pessoais encontrados:', candidate ? 'Sim' : 'Não');
    
    // Mapear respostas do questionário
    const questionnaireAnswers = answers?.map(answer => ({
      ...answer,
      subject_name: 'Competências Técnicas',
      question_text: answer.question_text || `Questão ${answer.question_number}`,
      is_personal_data: false
    })) || [];

    // Adicionar dados pessoais como "questões" especiais
    const personalDataAnswers = [];
    let personalQuestionNumber = (answers?.length || 0) + 1;

    if (candidate) {
      if (candidate.personal_presentation) {
        personalDataAnswers.push({
          id: `personal_${personalQuestionNumber}`,
          assessment_id: assessmentId,
          subject_id: 'personal',
          question_number: personalQuestionNumber++,
          question_text: 'Apresentação Pessoal',
          answer_value: candidate.personal_presentation,
          answer_score: 5,
          is_correct: true,
          time_spent_seconds: 0,
          subject_name: 'Dados Pessoais',
          is_personal_data: true,
          created_at: new Date().toISOString()
        });
      }

      if (candidate.additional_skills) {
        personalDataAnswers.push({
          id: `personal_${personalQuestionNumber}`,
          assessment_id: assessmentId,
          subject_id: 'personal',
          question_number: personalQuestionNumber++,
          question_text: 'Habilidades Adicionais',
          answer_value: candidate.additional_skills,
          answer_score: 5,
          is_correct: true,
          time_spent_seconds: 0,
          subject_name: 'Dados Pessoais',
          is_personal_data: true,
          created_at: new Date().toISOString()
        });
      }

      if (candidate.highlighted_soft_skills) {
        personalDataAnswers.push({
          id: `personal_${personalQuestionNumber}`,
          assessment_id: assessmentId,
          subject_id: 'personal',
          question_number: personalQuestionNumber++,
          question_text: 'Soft Skills em Destaque',
          answer_value: candidate.highlighted_soft_skills,
          answer_score: 5,
          is_correct: true,
          time_spent_seconds: 0,
          subject_name: 'Dados Pessoais',
          is_personal_data: true,
          created_at: new Date().toISOString()
        });
      }

      if (candidate.relevant_experiences) {
        personalDataAnswers.push({
          id: `personal_${personalQuestionNumber}`,
          assessment_id: assessmentId,
          subject_id: 'personal',
          question_number: personalQuestionNumber++,
          question_text: 'Experiências Relevantes',
          answer_value: candidate.relevant_experiences,
          answer_score: 5,
          is_correct: true,
          time_spent_seconds: 0,
          subject_name: 'Dados Pessoais',
          is_personal_data: true,
          created_at: new Date().toISOString()
        });
      }

      if (candidate.professional_goals) {
        personalDataAnswers.push({
          id: `personal_${personalQuestionNumber}`,
          assessment_id: assessmentId,
          subject_id: 'personal',
          question_number: personalQuestionNumber++,
          question_text: 'Objetivos Profissionais',
          answer_value: candidate.professional_goals,
          answer_score: 5,
          is_correct: true,
          time_spent_seconds: 0,
          subject_name: 'Dados Pessoais',
          is_personal_data: true,
          created_at: new Date().toISOString()
        });
      }

      // URLs profissionais
      const urls = [
        { field: candidate.linkedin_url, label: 'LinkedIn' },
        { field: candidate.portfolio_url, label: 'Portfólio' },
        { field: candidate.github_url, label: 'GitHub' },
        { field: candidate.behance_url, label: 'Behance/Dribbble' },
        { field: candidate.instagram_url, label: 'Instagram' }
      ];

      urls.forEach(({ field, label }) => {
        if (field) {
          personalDataAnswers.push({
            id: `personal_${personalQuestionNumber}`,
            assessment_id: assessmentId,
            subject_id: 'personal',
            question_number: personalQuestionNumber++,
            question_text: `URL ${label}`,
            answer_value: field,
            answer_score: 5,
            is_correct: true,
            time_spent_seconds: 0,
            subject_name: 'Links Profissionais',
            is_personal_data: true,
            created_at: new Date().toISOString()
          });
        }
      });
    }

    console.log('🔧 DEBUG - Dados pessoais adicionados:', personalDataAnswers.length);
    console.log('🔧 DEBUG - Total final:', questionnaireAnswers.length + personalDataAnswers.length);

    // Combinar respostas do questionário + dados pessoais
    return [...questionnaireAnswers, ...personalDataAnswers];
  }

  /**
   * Relatório detalhado de uma avaliação específica
   */
  static async getAssessmentReport(assessmentId: string): Promise<AssessmentDetailedReport | null> {
    const { data, error } = await supabase
      .from('assessment_detailed_report')
      .select('*')
      .eq('assessment_id', assessmentId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar relatório:', error);
      throw new Error(`Erro ao buscar relatório: ${error.message}`);
    }

    return data;
  }

  /**
   * Relatório de desempenho por matéria com fallback
   */
  static async getSubjectPerformanceReport(): Promise<SubjectPerformance[]> {
    return this.retryOperation(async () => {
      // Tentar usar a view primeiro
      const { data, error } = await supabase
        .from('subject_performance')
        .select('*')
        .order('avg_score', { ascending: false });

      if (error) {
        console.warn('View subject_performance não encontrada, usando consulta direta:', error.message);
        
        // Fallback: buscar matérias ativas
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (subjectsError) {
          throw new Error(`Erro ao buscar matérias: ${subjectsError.message}`);
        }

        // Transformar dados para o formato esperado
        return (subjectsData || []).map(subject => ({
          subject_id: subject.id,
          subject_name: subject.name,
          subject_description: subject.description,
          subject_weight: subject.weight,
          total_answers: 0,
          avg_score: 0,
          correct_answers: 0,
          success_rate_percentage: 0
        }));
      }

      return data || [];
    });
  }


  /**
   * Estatísticas gerais do sistema com retry e diagnóstico
   */
  static async getSystemStats() {
    return this.retryOperation(async () => {
      try {
        console.log('🔍 Buscando estatísticas do sistema...');

        // Verificar e corrigir status das avaliações se necessário
        // (será feito via SQL separadamente)

        // Buscar estatísticas com consultas mais específicas (sem tabela questions)
        const [candidatesResult, assessmentsResult, completedResult] = await Promise.all([
          supabase.from('candidates').select('id', { count: 'exact', head: true }),
          supabase.from('assessments').select('id', { count: 'exact', head: true }),
          supabase.from('assessments').select('id', { count: 'exact', head: true })
            .not('completed_at', 'is', null) // Tem completed_at
        ]);

        const totalCandidates = candidatesResult.count || 0;
        const totalAssessments = assessmentsResult.count || 0;
        const completedCount = completedResult.count || 0;
        
        // Contar questões únicas nas respostas (aproximação)
        const { data: uniqueQuestions } = await supabase
          .from('assessment_answers')
          .select('question_number')
          .order('question_number');
        
        const totalQuestions = uniqueQuestions ? 
          new Set(uniqueQuestions.map(q => q.question_number)).size : 0;
        
        // Calcular taxa de conclusão
        const completionRate = totalAssessments > 0 ? 
          Math.round((completedCount / totalAssessments) * 100) : 0;

        console.log('📊 Estatísticas calculadas:', {
          totalCandidates,
          totalAssessments, 
          completedCount,
          completionRate,
          totalQuestions
        });

        return {
          total_candidates: totalCandidates,
          total_assessments: totalAssessments,
          completed_assessments: completedCount,
          completion_rate: completionRate,
          total_questions: totalQuestions
        };
      } catch (error) {
        console.error('❌ Erro ao buscar estatísticas:', error);
        // Fallback: tentar consulta simples
        try {
          const { data: candidates } = await supabase.from('candidates').select('id');
          const { data: assessments } = await supabase.from('assessments').select('id, completed_at');
          
          const totalCandidates = candidates?.length || 0;
          const totalAssessments = assessments?.length || 0;
          const completedCount = assessments?.filter(a => a.completed_at).length || 0;
          const completionRate = totalAssessments > 0 ? 
            Math.round((completedCount / totalAssessments) * 100) : 0;

          console.log('📊 Estatísticas (fallback):', {
            totalCandidates,
            totalAssessments,
            completedCount,
            completionRate
          });

          return {
            total_candidates: totalCandidates,
            total_assessments: totalAssessments,
            completed_assessments: completedCount,
            completion_rate: completionRate
          };
        } catch (fallbackError) {
          console.error('❌ Erro no fallback:', fallbackError);
          return {
            total_candidates: 0,
            total_assessments: 0,
            completed_assessments: 0,
            completion_rate: 0
          };
        }
      }
    });
  }

  // ============================================
  // UTILITÁRIOS
  // ============================================
  
  /**
   * Obter IP do cliente (aproximado)
   */
  private static async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Verificar se o banco está configurado
   */
  static async checkDatabaseHealth(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('id')
        .limit(1);

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Deleta um candidato e todos os dados relacionados
   * IMPORTANTE: Esta operação é irreversível!
   * Deleta em cascata:
   * - Assessments do candidato
   * - Assessment answers dos assessments
   * - Candidate record
   */
  static async deleteCandidate(candidateId: string): Promise<void> {
    try {
      // 1. Buscar todos os assessments do candidato
      const { data: assessments, error: assessmentsError } = await supabase
        .from('assessments')
        .select('id')
        .eq('candidate_id', candidateId);

      if (assessmentsError) throw assessmentsError;

      // 2. Deletar todas as respostas dos assessments
      if (assessments && assessments.length > 0) {
        const assessmentIds = assessments.map(a => a.id);
        
        const { error: answersError } = await supabase
          .from('assessment_answers')
          .delete()
          .in('assessment_id', assessmentIds);

        if (answersError) throw answersError;
      }

      // 3. Deletar todos os assessments do candidato
      const { error: deleteAssessmentsError } = await supabase
        .from('assessments')
        .delete()
        .eq('candidate_id', candidateId);

      if (deleteAssessmentsError) throw deleteAssessmentsError;

      // 4. Deletar o candidato
      const { error: deleteCandidateError } = await supabase
        .from('candidates')
        .delete()
        .eq('id', candidateId);

      if (deleteCandidateError) throw deleteCandidateError;

    } catch (error: any) {
      console.error('Erro ao deletar candidato:', error);
      throw new Error(`Falha ao deletar candidato: ${error.message}`);
    }
  }
}
