/**
 * 🎯 CONFIGURAÇÃO CENTRALIZADA DO CLIENTE
 * 
 * Este arquivo centraliza todas as configurações personalizáveis
 * para transformar a aplicação em white-label.
 * 
 * IMPORTANTE: Todas as configurações têm fallbacks para manter
 * a funcionalidade atual da Quest Nós como padrão.
 */

// Tipos para configuração do cliente
export interface ClientConfig {
  company: {
    name: string;
    logo: string;
    favicon: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    contact: {
      email: string;
      phone: string;
      address: string;
      website: string;
    };
  };
  legal: {
    termsUrl: string;
    privacyUrl: string;
    companyDocument: string;
    companyName: string;
  };
  features: {
    questionnaire: boolean;
    admin: boolean;
    reports: boolean;
    personalPresentation: boolean;
    aboutPage: boolean;
  };
  branding: {
    heroTitle: string;
    heroSubtitle: string;
    tagline: string;
    description: string;
  };
}

/**
 * Configuração principal do cliente
 * Usa variáveis de ambiente com fallbacks para VLUMA RH
 */
export const CLIENT_CONFIG: ClientConfig = {
  company: {
    name: import.meta.env.VITE_COMPANY_NAME || 'VLUMA RH',
    logo: import.meta.env.VITE_COMPANY_LOGO || '/vluma-logo.png',
    favicon: import.meta.env.VITE_COMPANY_FAVICON || '/favicon.svg',
    colors: {
      primary: import.meta.env.VITE_PRIMARY_COLOR || '#FF6B35',
      secondary: import.meta.env.VITE_SECONDARY_COLOR || '#1B365D',
      accent: import.meta.env.VITE_ACCENT_COLOR || '#FF7A4D'
    },
    contact: {
      email: import.meta.env.VITE_CONTACT_EMAIL || 'contato@vluma.com.br',
      phone: import.meta.env.VITE_CONTACT_PHONE || '(11) 0000-0000',
      address: import.meta.env.VITE_COMPANY_ADDRESS || 'São Paulo, SP',
      website: import.meta.env.VITE_COMPANY_WEBSITE || 'vluma.com.br'
    }
  },
  legal: {
    termsUrl: import.meta.env.VITE_TERMS_URL || '/termos-de-uso.md',
    privacyUrl: import.meta.env.VITE_PRIVACY_URL || '/politica-de-privacidade.md',
    companyDocument: import.meta.env.VITE_COMPANY_CNPJ || '00.000.000/0001-00',
    companyName: import.meta.env.VITE_LEGAL_COMPANY_NAME || 'VLUMA Tecnologia Ltda'
  },
  features: {
    questionnaire: import.meta.env.VITE_FEATURE_QUESTIONNAIRE !== 'false',
    admin: import.meta.env.VITE_FEATURE_ADMIN !== 'false',
    reports: import.meta.env.VITE_FEATURE_REPORTS !== 'false',
    personalPresentation: import.meta.env.VITE_FEATURE_PRESENTATION !== 'false',
    aboutPage: import.meta.env.VITE_FEATURE_ABOUT !== 'false'
  },
  branding: {
    heroTitle: import.meta.env.VITE_HERO_TITLE || 'Transforme sua gestão de pessoas com IA',
    heroSubtitle: import.meta.env.VITE_HERO_SUBTITLE || 'Automação inteligente e processos humanizados para revolucionar o RH da sua empresa.',
    tagline: import.meta.env.VITE_TAGLINE || 'Onde a tecnologia encontra o humano no RH',
    description: import.meta.env.VITE_DESCRIPTION || 'Plataforma de RH com Inteligência Artificial da VLUMA. Automatize processos, humanize relacionamentos e transforme a gestão de pessoas da sua empresa.'
  }
};

/**
 * Função para aplicar cores dinâmicas no CSS
 * Injeta CSS variables baseadas na configuração
 */
export const applyClientTheme = () => {
  const root = document.documentElement;
  
  // Aplicar cores personalizadas
  root.style.setProperty('--client-primary', CLIENT_CONFIG.company.colors.primary);
  root.style.setProperty('--client-secondary', CLIENT_CONFIG.company.colors.secondary);
  root.style.setProperty('--client-accent', CLIENT_CONFIG.company.colors.accent);
  
  // Atualizar favicon se personalizado
  if (CLIENT_CONFIG.company.favicon !== '/favicon.svg') {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = CLIENT_CONFIG.company.favicon;
    }
  }
  
  // Atualizar título da página
  document.title = `${CLIENT_CONFIG.company.name} - ${CLIENT_CONFIG.branding.tagline}`;
};

/**
 * Hook para usar configuração do cliente em componentes React
 */
export const useClientConfig = () => {
  return CLIENT_CONFIG;
};

/**
 * Função para validar se uma feature está habilitada
 */
export const isFeatureEnabled = (feature: keyof ClientConfig['features']): boolean => {
  return CLIENT_CONFIG.features[feature];
};

/**
 * Função para obter informações de contato formatadas
 */
export const getContactInfo = () => {
  return {
    email: CLIENT_CONFIG.company.contact.email,
    phone: CLIENT_CONFIG.company.contact.phone,
    address: CLIENT_CONFIG.company.contact.address,
    website: CLIENT_CONFIG.company.contact.website,
    // Formatações úteis
    emailLink: `mailto:${CLIENT_CONFIG.company.contact.email}`,
    phoneLink: `tel:${CLIENT_CONFIG.company.contact.phone.replace(/\D/g, '')}`,
    websiteLink: CLIENT_CONFIG.company.contact.website.startsWith('http') 
      ? CLIENT_CONFIG.company.contact.website 
      : `https://${CLIENT_CONFIG.company.contact.website}`
  };
};

/**
 * Função para obter informações legais formatadas
 */
export const getLegalInfo = () => {
  return {
    companyName: CLIENT_CONFIG.legal.companyName,
    document: CLIENT_CONFIG.legal.companyDocument,
    termsUrl: CLIENT_CONFIG.legal.termsUrl,
    privacyUrl: CLIENT_CONFIG.legal.privacyUrl,
    // Data de atualização automática
    lastUpdate: new Date().toLocaleDateString('pt-BR')
  };
};

/**
 * Função para debug - mostra configuração atual
 * REMOVER EM PRODUÇÃO
 */
export const debugClientConfig = () => {
  if (import.meta.env.DEV) {
    console.group('🎯 Client Configuration');
    console.log('Company:', CLIENT_CONFIG.company.name);
    console.log('Features:', CLIENT_CONFIG.features);
    console.log('Colors:', CLIENT_CONFIG.company.colors);
    console.groupEnd();
  }
};
