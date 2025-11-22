/**
 * 🎨 PAINEL DE PERSONALIZAÇÃO DA MARCA
 * 
 * Interface administrativa para personalizar branding,
 * cores, textos e funcionalidades da aplicação.
 */

import { useState, useEffect } from 'react';
import { brandingService, type BrandingConfig } from '@/services/brandingService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Palette, 
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  FileText, 
  Upload, 
  Eye, 
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export function AdminBranding() {
  const [config, setConfig] = useState<Partial<BrandingConfig>>({
    company_name: 'VLUMA RH',
    tagline: 'Onde a tecnologia encontra o humano no RH',
    description: 'Plataforma de RH com Inteligência Artificial da VLUMA. Automatize processos, humanize relacionamentos e transforme a gestão de pessoas da sua empresa.',
    logo_url: '/vluma-logo.png',
    favicon_url: '/favicon.svg',
    primary_color: '#FF6B35',
    secondary_color: '#1B365D',
    accent_color: '#FF7A4D',
    contact_email: 'contato@vluma.com.br',
    contact_phone: '(11) 0000-0000',
    contact_address: 'São Paulo, SP',
    contact_website: 'vluma.com.br',
    company_document: '00.000.000/0001-00',
    legal_company_name: 'VLUMA Tecnologia Ltda',
    hero_title: 'Transforme sua gestão de pessoas com IA',
    hero_subtitle: 'Automação inteligente e processos humanizados para revolucionar o RH da sua empresa.',
    enabled_features: {
      questionnaire: true,
      admin: true,
      reports: true,
      personalPresentation: true,
      aboutPage: true,
    }
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar configuração atual
  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Buscar configuração atual do banco de dados
      const currentBranding = await brandingService.getCurrentBranding();
      
      if (currentBranding) {
        setConfig(currentBranding);
        // Aplicar configurações automaticamente
        await brandingService.applyBrandingToDOM(currentBranding);
      } else {
        // Fallback para localStorage se não houver no banco
        const storedConfig = brandingService.getBrandingFromStorage();
        if (storedConfig) {
          setConfig(storedConfig);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      setError('Erro ao carregar configurações. Usando configuração padrão.');
      
      // Fallback para localStorage em caso de erro
      const storedConfig = brandingService.getBrandingFromStorage();
      if (storedConfig) {
        setConfig(storedConfig);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    try {
      // Validar configuração antes de salvar
      const validation = brandingService.validateBranding(config);
      if (!validation.valid) {
        setError(`Erro de validação: ${validation.errors.join(', ')}`);
        return;
      }

      // Salvar no banco de dados
      const result = await brandingService.saveBranding(config);
      
      if (result.success && result.data) {
        setConfig(result.data);
        
        // Aplicar configurações em tempo real
        await brandingService.applyBrandingToDOM(result.data);
        
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(result.error || 'Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setError('Erro interno ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'favicon') => {
    try {
      setSaving(true);
      
      const result = await brandingService.uploadFile(file, type);
      
      if (result.success && result.url) {
        setConfig(prev => ({
          ...prev,
          [type === 'logo' ? 'logo_url' : 'favicon_url']: result.url
        }));
      } else {
        setError(result.error || 'Erro no upload do arquivo');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      setError('Erro interno no upload');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Tem certeza que deseja resetar para a configuração padrão?')) {
      setSaving(true);
      try {
        const result = await brandingService.resetToDefault();
        if (result.success) {
          await loadCurrentConfig();
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        } else {
          setError(result.error || 'Erro ao resetar configurações');
        }
      } catch (error) {
        console.error('Erro ao resetar:', error);
        setError('Erro interno ao resetar');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleColorChange = (colorType: 'primary_color' | 'secondary_color' | 'accent_color', value: string) => {
    setConfig(prev => ({
      ...prev,
      [colorType]: value
    }));
    
    // Preview em tempo real
    if (previewMode) {
      const root = document.documentElement;
      const cssVar = colorType === 'primary_color' ? '--brand-primary' : 
                     colorType === 'secondary_color' ? '--brand-secondary' : '--brand-accent';
      root.style.setProperty(cssVar, value);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Personalização da Marca</h1>
          <p className="text-muted-foreground mt-2">
            Configure a identidade visual e informações da sua empresa
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2"
            disabled={loading}
          >
            <Eye className="w-4 h-4" />
            {previewMode ? 'Sair do Preview' : 'Preview'}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={saving || loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Resetar
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <Alert className="mb-6">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <AlertDescription>
            Carregando configurações...
          </AlertDescription>
        </Alert>
      )}

      {/* Error State */}
      {error && (
        <Alert className="mb-6 border-red-500 bg-red-50">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Preview Mode Alert */}
      {previewMode && (
        <Alert className="mb-6 border-brand-primary bg-brand-primary/5">
          <Eye className="w-4 h-4" />
          <AlertDescription>
            <strong>Modo Preview Ativo:</strong> As alterações são aplicadas em tempo real. 
            Clique em "Salvar Alterações" para confirmar.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="identity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="identity" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Identidade
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Cores
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Contato
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Conteúdo
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Recursos
          </TabsTrigger>
        </TabsList>

        {/* IDENTIDADE VISUAL */}
        <TabsContent value="identity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Identidade Visual
              </CardTitle>
              <CardDescription>
                Configure o nome, logo e elementos visuais da sua empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome da Empresa</Label>
                  <Input
                    id="companyName"
                    value={config.companyName}
                    onChange={(e) => setConfig(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Nome da sua empresa"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={config.tagline}
                    onChange={(e) => setConfig(prev => ({ ...prev, tagline: e.target.value }))}
                    placeholder="Slogan da empresa"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição da Empresa</Label>
                <Textarea
                  id="description"
                  value={config.description}
                  onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva sua empresa em poucas palavras"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Logo da Empresa</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    {config.logoUrl && config.logoUrl !== '/logo.svg' ? (
                      <div className="space-y-3">
                        <img 
                          src={config.logoUrl} 
                          alt="Logo" 
                          className="max-h-20 mx-auto"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('logo-upload')?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Alterar Logo
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                        <div>
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById('logo-upload')?.click()}
                          >
                            Upload Logo
                          </Button>
                          <p className="text-sm text-muted-foreground mt-2">
                            PNG, JPG ou SVG até 2MB
                          </p>
                        </div>
                      </div>
                    )}
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'logo');
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Favicon</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    {config.faviconUrl && config.faviconUrl !== '/favicon.svg' ? (
                      <div className="space-y-3">
                        <img 
                          src={config.faviconUrl} 
                          alt="Favicon" 
                          className="w-8 h-8 mx-auto"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('favicon-upload')?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Alterar Favicon
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-6 h-6 mx-auto text-muted-foreground" />
                        <div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('favicon-upload')?.click()}
                          >
                            Upload Favicon
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            ICO, PNG 32x32px
                          </p>
                        </div>
                      </div>
                    )}
                    <input
                      id="favicon-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'favicon');
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CORES */}
        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Paleta de Cores
              </CardTitle>
              <CardDescription>
                Defina as cores principais da sua marca
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="primaryColor">Cor Primária</Label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      id="primaryColor"
                      value={config.primary_color}
                      onChange={(e) => handleColorChange('primary_color', e.target.value)}
                      className="w-12 h-12 rounded border border-border cursor-pointer"
                    />
                    <Input
                      value={config.primary_color}
                      onChange={(e) => handleColorChange('primary_color', e.target.value)}
                      placeholder="#3B82F6"
                      className="font-mono"
                    />
                  </div>
                  <div 
                    className="h-8 rounded border"
                    style={{ backgroundColor: config.primary_color }}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="secondaryColor">Cor Secundária</Label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      id="secondaryColor"
                      value={config.secondary_color}
                      onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                      className="w-12 h-12 rounded border border-border cursor-pointer"
                    />
                    <Input
                      value={config.secondary_color}
                      onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                      placeholder="#1E40AF"
                      className="font-mono"
                    />
                  </div>
                  <div 
                    className="h-8 rounded border"
                    style={{ backgroundColor: config.secondary_color }}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="accentColor">Cor de Destaque</Label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      id="accentColor"
                      value={config.accent_color}
                      onChange={(e) => handleColorChange('accent_color', e.target.value)}
                      className="w-12 h-12 rounded border border-border cursor-pointer"
                    />
                    <Input
                      value={config.accent_color}
                      onChange={(e) => handleColorChange('accent_color', e.target.value)}
                      placeholder="#06B6D4"
                      className="font-mono"
                    />
                  </div>
                  <div 
                    className="h-8 rounded border"
                    style={{ backgroundColor: config.accent_color }}
                  />
                </div>
              </div>

              <Alert>
                <Palette className="w-4 h-4" />
                <AlertDescription>
                  <strong>Dica:</strong> Use o modo Preview para ver as cores aplicadas em tempo real na interface.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONTATO */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Informações de Contato
              </CardTitle>
              <CardDescription>
                Configure os dados de contato da sua empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Principal</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={config.email}
                      onChange={(e) => setConfig(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="contato@suaempresa.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={config.phone}
                      onChange={(e) => setConfig(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 9999-9999"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="website"
                      value={config.website}
                      onChange={(e) => setConfig(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="suaempresa.com.br"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço/Cidade</Label>
                  <Input
                    id="address"
                    value={config.address}
                    onChange={(e) => setConfig(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="São Paulo, SP"
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Informações Legais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      value={config.cnpj}
                      onChange={(e) => setConfig(prev => ({ ...prev, cnpj: e.target.value }))}
                      placeholder="00.000.000/0001-00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legalName">Razão Social</Label>
                    <Input
                      id="legalName"
                      value={config.legalName}
                      onChange={(e) => setConfig(prev => ({ ...prev, legalName: e.target.value }))}
                      placeholder="Sua Empresa Ltda"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONTEÚDO */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Conteúdo da Página
              </CardTitle>
              <CardDescription>
                Personalize os textos principais da aplicação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="heroTitle">Título Principal</Label>
                <Input
                  id="heroTitle"
                  value={config.heroTitle}
                  onChange={(e) => setConfig(prev => ({ ...prev, heroTitle: e.target.value }))}
                  placeholder="Encontre os melhores talentos"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="heroSubtitle">Subtítulo</Label>
                <Textarea
                  id="heroSubtitle"
                  value={config.heroSubtitle}
                  onChange={(e) => setConfig(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                  placeholder="Conectamos você com profissionais qualificados e diversos."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RECURSOS */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Recursos Disponíveis
              </CardTitle>
              <CardDescription>
                Ative ou desative funcionalidades da aplicação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {Object.entries(config.features).map(([key, enabled]) => {
                  const featureLabels = {
                    questionnaire: 'Questionário de Habilidades',
                    admin: 'Dashboard Administrativo',
                    reports: 'Relatórios e Análises',
                    personalPresentation: 'Apresentação Pessoal',
                    aboutPage: 'Página "Sobre"'
                  };

                  return (
                    <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="text-base font-medium">
                          {featureLabels[key as keyof typeof featureLabels]}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {enabled ? 'Recurso ativado' : 'Recurso desativado'}
                        </p>
                      </div>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => 
                          setConfig(prev => ({
                            ...prev,
                            features: { ...prev.features, [key]: checked }
                          }))
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
