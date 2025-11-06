import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { AssessmentService } from "@/services/assessmentService";
import type { 
  CandidateFormData, 
  AssessmentSubmission,
  Candidate,
  Assessment,
  PersonalPresentationData
} from "@/types/database";

// ============================================
// HOOKS PARA CANDIDATOS
// ============================================

export function useCreateCandidate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (candidateData: CandidateFormData) => 
      AssessmentService.createCandidate(candidateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
}

export function useCandidateByEmail(email: string) {
  return useQuery({
    queryKey: ['candidate', email],
    queryFn: () => AssessmentService.getCandidateByEmail(email),
    enabled: !!email,
  });
}

export function useSavePersonalPresentation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ candidateId, presentationData }: { 
      candidateId: string; 
      presentationData: PersonalPresentationData 
    }) => AssessmentService.savePersonalPresentation(candidateId, presentationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
}

export function useAllCandidates() {
  return useQuery({
    queryKey: ['candidates', 'summary'],
    queryFn: () => AssessmentService.getAllCandidates(),
  });
}

// ============================================
// HOOKS PARA MATÉRIAS
// ============================================

export function useActiveSubjects() {
  return useQuery({
    queryKey: ['subjects', 'active'],
    queryFn: () => AssessmentService.getActiveSubjects(),
  });
}

// ============================================
// HOOKS PARA AVALIAÇÕES
// ============================================

export function useSubmitAssessment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (submission: AssessmentSubmission) => 
      AssessmentService.submitAssessment(submission),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      queryClient.invalidateQueries({ queryKey: ['candidate', data.candidate_id] });
    },
  });
}

export function useCandidateAssessments(candidateId: string) {
  return useQuery({
    queryKey: ['assessments', 'candidate', candidateId],
    queryFn: () => AssessmentService.getCandidateAssessments(candidateId),
    enabled: !!candidateId,
  });
}

export function useAssessmentAnswers(assessmentId: string) {
  return useQuery({
    queryKey: ['assessment', 'answers', assessmentId],
    queryFn: () => AssessmentService.getAssessmentAnswers(assessmentId),
    enabled: !!assessmentId,
  });
}

// ============================================
// HOOKS PARA RELATÓRIOS (ADMIN)
// ============================================

export function useAssessmentReport(assessmentId: string) {
  return useQuery({
    queryKey: ['assessment', 'report', assessmentId],
    queryFn: () => AssessmentService.getAssessmentReport(assessmentId),
    enabled: !!assessmentId,
  });
}

export function useSubjectPerformanceReport() {
  return useQuery({
    queryKey: ['reports', 'subject-performance'],
    queryFn: () => AssessmentService.getSubjectPerformanceReport(),
  });
}

export function useAssessmentAnswers(assessmentId: string) {
  return useQuery({
    queryKey: ['assessment', 'answers', assessmentId],
    queryFn: () => AssessmentService.getAssessmentAnswers(assessmentId),
    enabled: !!assessmentId,
  });
}

export function useSystemStats() {
  return useQuery({
    queryKey: ['system', 'stats'],
    queryFn: () => AssessmentService.getSystemStats(),
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });
}

// ============================================
// HOOKS PARA VERIFICAÇÃO DO SISTEMA
// ============================================

export function useDatabaseHealth() {
  return useQuery({
    queryKey: ['database', 'health'],
    queryFn: () => AssessmentService.checkDatabaseHealth(),
    refetchInterval: 60000, // Verificar a cada minuto
    retry: 3,
  });
}

// ============================================
// HOOKS GENÉRICOS (MANTIDOS PARA COMPATIBILIDADE)
// ============================================

export function useSupabaseQuery<T>(
  table: string,
  queryKey: string[],
  select?: string,
  filters?: Record<string, any>
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase.from(table).select(select || '*');
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as T[];
    },
  });
}

export function useSupabaseInsert<T>(table: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<T>) => {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      // Invalida queries relacionadas à tabela
      queryClient.invalidateQueries({ queryKey: [table] });
    },
  });
}

export function useSupabaseUpdate<T>(table: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string | number; data: Partial<T> }) => {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
    },
  });
}
