/**
 * 🎨 SERVIÇO DE BRANDING
 * 
 * Integração com a tabela client_branding para
 * salvar e recuperar configurações de personalização.
 */

import { supabase } from '@/lib/supabase';

export interface BrandingConfig {
  id?: string;
  company_name: string;
  tagline?: string;
  description?: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  contact_email?: string;
  contact_phone?: string;
  contact_address?: string;
  contact_website?: string;
  legal_company_name?: string;
  company_document?: string;
  hero_title: string;
  hero_subtitle: string;
  enabled_features: {
    questionnaire: boolean;
    admin: boolean;
    reports: boolean;
    personalPresentation: boolean;
    aboutPage: boolean;
  };
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

class BrandingService {
  /**
   * Obter configuração atual de branding
   */
  async getCurrentBranding(): Promise<BrandingConfig | null> {
    try {
      const { data, error } = await supabase
        .from('client_branding')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Erro ao buscar branding:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro no getCurrentBranding:', error);
      return null;
    }
  }

  /**
   * Salvar configuração de branding
   */
  async saveBranding(config: Partial<BrandingConfig>): Promise<{ success: boolean; data?: BrandingConfig; error?: string }> {
    try {
      // Primeiro, desativar configurações anteriores
      await supabase
        .from('client_branding')
        .update({ is_active: false })
        .eq('is_active', true);

      // Inserir nova configuração
      const { data, error } = await supabase
        .from('client_branding')
        .insert({
          ...config,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar branding:', error);
        return { success: false, error: error.message };
      }

      // Log da atividade
      await this.logActivity('branding_update', data.id, config);

      return { success: true, data };
    } catch (error) {
      console.error('Erro no saveBranding:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Atualizar configuração existente
   */
  async updateBranding(id: string, config: Partial<BrandingConfig>): Promise<{ success: boolean; data?: BrandingConfig; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('client_branding')
        .update(config)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar branding:', error);
        return { success: false, error: error.message };
      }

      // Log da atividade
      await this.logActivity('branding_update', id, config);

      return { success: true, data };
    } catch (error) {
      console.error('Erro no updateBranding:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Upload de arquivo (logo/favicon)
   */
  async uploadFile(file: File, type: 'logo' | 'favicon'): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = `branding/${fileName}`;

      const { data, error } = await supabase.storage
        .from('assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erro no upload:', error);
        return { success: false, error: error.message };
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      return { success: true, url: urlData.publicUrl };
    } catch (error) {
      console.error('Erro no uploadFile:', error);
      return { success: false, error: 'Erro no upload do arquivo' };
    }
  }

  /**
   * Aplicar configurações de branding no DOM
   */
  async applyBrandingToDOM(config?: BrandingConfig): Promise<void> {
    try {
      const branding = config || await this.getCurrentBranding();
      
      if (!branding) return;

      const root = document.documentElement;

      // Aplicar cores CSS
      root.style.setProperty('--brand-primary', branding.primary_color);
      root.style.setProperty('--brand-secondary', branding.secondary_color);
      root.style.setProperty('--brand-accent', branding.accent_color);

      // Atualizar título da página
      document.title = branding.company_name;

      // Atualizar favicon se disponível
      if (branding.favicon_url) {
        const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        if (favicon) {
          favicon.href = branding.favicon_url;
        }
      }

      // Salvar no localStorage para acesso rápido
      localStorage.setItem('currentBranding', JSON.stringify(branding));
    } catch (error) {
      console.error('Erro ao aplicar branding:', error);
    }
  }

  /**
   * Obter configuração do localStorage (fallback)
   */
  getBrandingFromStorage(): BrandingConfig | null {
    try {
      const stored = localStorage.getItem('currentBranding');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  /**
   * Validar configuração de branding
   */
  validateBranding(config: Partial<BrandingConfig>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.company_name || config.company_name.trim().length === 0) {
      errors.push('Nome da empresa é obrigatório');
    }

    if (config.primary_color && !/^#[0-9A-F]{6}$/i.test(config.primary_color)) {
      errors.push('Cor primária deve estar no formato hexadecimal (#RRGGBB)');
    }

    if (config.secondary_color && !/^#[0-9A-F]{6}$/i.test(config.secondary_color)) {
      errors.push('Cor secundária deve estar no formato hexadecimal (#RRGGBB)');
    }

    if (config.accent_color && !/^#[0-9A-F]{6}$/i.test(config.accent_color)) {
      errors.push('Cor de destaque deve estar no formato hexadecimal (#RRGGBB)');
    }

    if (config.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.contact_email)) {
      errors.push('Email de contato inválido');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Log de atividade
   */
  private async logActivity(action: string, resourceId: string, details: any): Promise<void> {
    try {
      await supabase
        .from('activity_logs')
        .insert({
          action,
          resource_type: 'branding',
          resource_id: resourceId,
          details: details,
          ip_address: await this.getClientIP(),
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Erro ao registrar log:', error);
    }
  }

  /**
   * Obter IP do cliente (simplificado)
   */
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Resetar para configuração padrão
   */
  async resetToDefault(): Promise<{ success: boolean; error?: string }> {
    const defaultConfig: Partial<BrandingConfig> = {
      company_name: 'VLUMA RH',
      tagline: 'Onde a tecnologia encontra o humano no RH',
      description: 'Plataforma de RH com Inteligência Artificial da VLUMA. Automatize processos, humanize relacionamentos e transforme a gestão de pessoas da sua empresa.',
      primary_color: '#FF6B35',
      secondary_color: '#1B365D',
      accent_color: '#FF7A4D',
      hero_title: 'Transforme sua gestão de pessoas com IA',
      hero_subtitle: 'Automação inteligente e processos humanizados para revolucionar o RH da sua empresa.',
      enabled_features: {
        questionnaire: true,
        admin: true,
        reports: true,
        personalPresentation: true,
        aboutPage: true
      }
    };

    return await this.saveBranding(defaultConfig);
  }
}

export const brandingService = new BrandingService();
