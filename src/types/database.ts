// Tipos para o banco de dados do Quest Nós

export interface Candidate {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  birth_date?: string;
  gender?: string;
  education_level?: string;
  experience_years?: number;
  accessibility_needs?: string;
  preferred_language: string;
  consent_data_processing: boolean;
  consent_marketing: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  weight: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Assessment {
  id: string;
  candidate_id: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  started_at: string;
  completed_at?: string;
  total_score?: number;
  percentage_score?: number;
  time_spent_minutes?: number;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

export interface AssessmentAnswer {
  id: string;
  assessment_id: string;
  subject_id: string;
  question_number: number;
  question_text: string;
  answer_value: string;
  answer_score?: number;
  is_correct?: boolean;
  time_spent_seconds?: number;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'super_admin';
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

// Views para relatórios
export interface CandidateSummary {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  education_level?: string;
  experience_years?: number;
  registration_date: string;
  total_assessments: number;
  completed_assessments: number;
  avg_score?: number;
  last_assessment_date?: string;
}

export interface SubjectPerformance {
  subject_name: string;
  subject_description?: string;
  total_answers: number;
  avg_score?: number;
  correct_answers: number;
  success_rate_percentage: number;
}

export interface AssessmentDetailedReport {
  assessment_id: string;
  candidate_name: string;
  candidate_email: string;
  status: string;
  started_at: string;
  completed_at?: string;
  total_score?: number;
  percentage_score?: number;
  time_spent_minutes?: number;
  total_questions_answered: number;
  correct_answers: number;
  accuracy_percentage: number;
}

// Tipos para formulários
export interface CandidateFormData {
  email: string;
  full_name: string;
  phone?: string;
  birth_date?: string;
  gender?: string;
  education_level?: string;
  experience_years?: number;
  accessibility_needs?: string;
  preferred_language?: string;
  consent_data_processing: boolean;
  consent_marketing: boolean;
}

export interface QuestionnaireAnswer {
  subject_id: string;
  question_number: number;
  question_text: string;
  answer_value: string;
  answer_score?: number;
  is_correct?: boolean;
  time_spent_seconds?: number;
}

export interface AssessmentSubmission {
  candidate_id: string;
  answers: QuestionnaireAnswer[];
  time_spent_minutes: number;
  ip_address?: string;
  user_agent?: string;
}
