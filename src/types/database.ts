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
  // Campos de aceite de termos
  terms_accepted: boolean;
  terms_accepted_at?: string;
  privacy_policy_accepted: boolean;
  privacy_policy_accepted_at?: string;
  terms_acceptance_ip?: string;
  // Campos de apresentação pessoal
  personal_presentation?: string;
  additional_skills?: string;
  highlighted_soft_skills?: string;
  relevant_experiences?: string;
  professional_goals?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  github_url?: string;
  behance_url?: string;
  instagram_url?: string;
  presentation_completed_at?: string;
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
  full_name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  gender?: string;
  education_level?: string;
  experience_years?: number;
  accessibility_needs?: string;
  preferred_language?: string;
  consent_data_processing: boolean;
  consent_marketing: boolean;
  terms_accepted: boolean;
  privacy_policy_accepted: boolean;
  terms_accepted_at?: string;
  privacy_policy_accepted_at?: string;
  terms_acceptance_ip?: string;
}

export interface PersonalPresentationData {
  personal_presentation?: string;
  additional_skills?: string;
  highlighted_soft_skills?: string;
  relevant_experiences?: string;
  professional_goals?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  github_url?: string;
  behance_url?: string;
  instagram_url?: string;
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
