"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { questionnaireSchema, QuestionnaireSchema } from "@/schemas/questionnaireSchema";
import { useCreateCandidate, useSubmitAssessment, useActiveSubjects } from "@/hooks/useSupabase";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import type { CandidateFormData, AssessmentSubmission, QuestionnaireAnswer } from "@/types/database";

// Import all step components
import BrandingRebrandingStep from "@/components/form-steps/BrandingRebrandingStep";
import CopywritingStep from "@/components/form-steps/CopywritingStep";
import RedacaoStep from "@/components/form-steps/RedacaoStep";
import ArteDesignStep from "@/components/form-steps/ArteDesignStep";
import MidiaSocialStep from "@/components/form-steps/MidiaSocialStep";
import LandingPagesStep from "@/components/form-steps/LandingPagesStep";
import PublicidadeStep from "@/components/form-steps/PublicidadeStep";
import MarketingStep from "@/components/form-steps/MarketingStep";
import TecnologiaAutomacoesStep from "@/components/form-steps/TecnologiaAutomacoesStep";
import HabilidadesComplementaresStep from "@/components/form-steps/HabilidadesComplementaresStep";
import SoftSkillsStep from "@/components/form-steps/SoftSkillsStep";
import SummaryStep from "@/components/form-steps/SummaryStep";

const steps = [
  { id: "brandingRebranding", name: "Branding & Rebranding", component: BrandingRebrandingStep },
  { id: "copywriting", name: "Copywriting", component: CopywritingStep },
  { id: "redacao", name: "Redação", component: RedacaoStep },
  { id: "arteDesign", name: "Arte & Design", component: ArteDesignStep },
  { id: "midiaSocial", name: "Mídia Social", component: MidiaSocialStep },
  { id: "landingPages", name: "Landing Pages", component: LandingPagesStep },
  { id: "publicidade", name: "Publicidade", component: PublicidadeStep },
  { id: "marketing", name: "Marketing", component: MarketingStep },
  { id: "tecnologiaAutomacoes", name: "Tecnologia & Automações", component: TecnologiaAutomacoesStep },
  { id: "habilidadesComplementares", name: "Habilidades Complementares", component: HabilidadesComplementaresStep },
  { id: "softSkills", name: "Soft Skills", component: SoftSkillsStep },
  { id: "summary", name: "Resumo", component: SummaryStep },
];

// Definindo o tipo para os dados do candidato
interface MultiStepQuestionnaireProps {
  candidateInfo: {
    name: string;
    email: string;
    phone: string;
    areaOfExpertise: string;
    yearsOfExperience: number;
  };
  onBack?: () => void;
  onSuccess?: (candidateId: string) => void;
}

// Gerando valores padrão baseados no esquema atualizado
const defaultValues: QuestionnaireSchema = {
  brandingRebranding: {
    estrategiaDeMarca: {
      desenvolvimentoIdentidadeVisual: 1, criacaoNamingTaglines: 1, arquiteturaMarca: 1,
      posicionamentoEstrategico: 1, brandGuidelinesManuais: 1, pesquisaMercadoPersonas: 1,
      analiseConcorrencia: 1,
    },
    rebranding: {
      auditoriaMarcaExistente: 1, estrategiaTransicaoMarca: 1, gestaoMudancaOrganizacional: 1,
      comunicacaoRebranding: 1,
    },
  },
  copywriting: {
    tecnicasDeEscrita: {
      headlinesTitulosPersuasivos: 1, callToActionEfetivos: 1, storytellingComercial: 1,
      copywritingConversao: 1, seoCopywriting: 1, microcopyUxWriting: 1,
    },
    formatos: {
      anunciosPagos: 1, emailMarketing: 1, scriptsVideo: 1,
      copyRedesSociais: 1, salesPages: 1,
    },
  },
  redacao: {
    conteudoEditorial: {
      artigosBlogSeo: 1, pressReleases: 1, casosEstudo: 1,
      ebooksWhitepapers: 1, newsletters: 1, roteirosScripts: 1,
    },
    tomVoz: {
      adaptacaoLinguagemPublico: 1, redacaoTecnica: 1, redacaoCriativa: 1,
      revisaoEdicaoTextos: 1, gramaticaOrtografiaPtBr: 1,
    },
  },
  arteDesign: {
    designGrafico: {
      adobePhotoshop: 1, adobeIllustrator: 1, adobeInDesign: 1,
      figma: 1, canvaPro: 1, corelDRAW: 1,
    },
    habilidadesCriativas: {
      teoriaCores: 1, tipografia: 1, composicaoVisual: 1,
      ilustracaoDigital: 1, manipulacaoImagens: 1, motionGraphicsBasico: 1,
      designApresentacoes: 1,
    },
    materiais: {
      pecasRedesSociais: 1, bannersOutdoors: 1, materiaisImpressos: 1,
      embalagens: 1, identidadeVisualCompleta: 1,
    },
  },
  midiaSocial: {
    plataformas: {
      instagram: 1, facebook: 1, linkedin: 1,
      tiktok: 1, youtube: 1, twitterX: 1,
      pinterest: 1,
    },
    gestao: {
      planejamentoConteudo: 1, calendarioEditorial: 1, analiseMetricasKpis: 1,
      gerenciamentoComunidade: 1, atendimentoCliente: 1, gestaoCrises: 1,
    },
    ferramentas: {
      metaBusinessSuite: 1, hootsuiteBuffer: 1, sproutSocial: 1,
      laterPlanable: 1, analiseNativaPlataformas: 1,
    },
  },
  landingPages: {
    desenvolvimento: {
      htmlCssBasico: 1, wordpress: 1, elementorWpBakery: 1,
      unbounce: 1, leadpages: 1, webflow: 1,
      rdStationHubSpot: 1,
    },
    otimizacao: {
      uxUiConversao: 1, testesAb: 1, otimizacaoFormularios: 1,
      copywritingLandingPages: 1, analiseHeatmaps: 1, pageSpeedOptimization: 1,
      mobileResponsiveness: 1,
    },
    integracoes: {
      googleAnalytics: 1, googleTagManager: 1, pixelFacebookMeta: 1,
      crm: 1, ferramentasAutomacao: 1,
    },
  },
  publicidade: {
    midiaPaga: {
      googleAds: 1, metaAds: 1, linkedinAds: 1,
      tiktokAds: 1, pinterestAds: 1, programatica: 1,
    },
    estrategia: {
      definicaoPublicoAlvo: 1, segmentacaoAvancada: 1, budgetLances: 1,
      funisConversao: 1, remarketingRetargeting: 1, analiseRoiRoas: 1,
    },
    creative: {
      criacaoAnuncios: 1, testesCriativos: 1, videoAds: 1,
      carouselColecoes: 1,
    },
  },
  marketing: {
    marketingDigital: {
      seo: 1, marketingConteudo: 1, emailMarketing: 1,
      marketingPerformance: 1, growthHacking: 1, marketingInfluencia: 1,
    },
    estrategia: {
      planejamentoEstrategico: 1, definicaoKpis: 1, analiseMercado: 1,
      buyerPersonas: 1, funilVendas: 1, customerJourneyMapping: 1,
    },
    analiseDados: {
      googleAnalyticsGa4: 1, googleSearchConsole: 1, dataStudioLookerStudio: 1,
      excelGoogleSheetsAvancado: 1, interpretacaoMetricas: 1, relatoriosPerformance: 1,
    },
    automacao: {
      rdStation: 1, hubSpot: 1, mailchimp: 1,
      activeCampaign: 1, zapierMake: 1,
    },
  },
  tecnologiaAutomacoes: {
    infraestruturaTecnologica: {
      dominiosDns: 1, hospedagemWeb: 1, servidoresCloudComputing: 1,
      sslCertificadosSeguranca: 1, cdn: 1, backupRecuperacaoDados: 1,
    },
    desenvolvimentoWeb: {
      htmlCss3: 1, javaScriptBasico: 1, wordpressInstalacaoConfiguracao: 1,
      pluginsEssenciaisWordpress: 1, phpBasico: 1, apisIntegracoes: 1,
      versionamentoGitGithub: 1, responsiveDesign: 1,
    },
    cmsPlataformas: {
      wordpress: 1, webflow: 1, shopify: 1,
      wixSquarespace: 1, drupalJoomla: 1, headlessCms: 1,
    },
    automacaoMarketing: {
      rdStationMarketing: 1, hubSpotWorkflows: 1, activeCampaignAutomacoes: 1,
      mailchimpCustomerJourneys: 1, klaviyoEcommerceAutomation: 1, marketingCloudSalesforce: 1,
    },
    automacaoProcessosNoCodeLowCode: {
      zapier: 1, makeIntegromat: 1, n8n: 1,
      pabblyConnect: 1, automateIo: 1, microsoftPowerAutomate: 1,
      ifttt: 1,
    },
    automacaoRedesSociais: {
      agendamentoAutomatico: 1, chatbotsInstagramFacebook: 1, manyChat: 1,
      chatfuel: 1, respostaAutomaticaDm: 1, automacaoStoriesPosts: 1,
    },
    crmGestaoClientes: {
      hubSpotCrm: 1, rdStationCrm: 1, salesforce: 1,
      pipedrive: 1, bitrix24: 1, zohoCrm: 1,
      mondaySalesCrm: 1,
    },
    automacaoWhatsappBusiness: {
      whatsappBusinessApi: 1, chatbotsWhatsapp: 1, integracaoCrm: 1,
      disparosMassa: 1, automacaoAtendimento: 1, plataformasTwilioZenviaTakeBlip: 1,
    },
    iaFerramentasInteligentes: {
      chatGptClaude: 1, midjourneyDallE: 1, jasperAi: 1,
      copyAi: 1, runwayMl: 1, removeBg: 1,
      grammarly: 1, iaAnaliseDados: 1,
    },
    automacaoRelatorios: {
      googleDataStudioLookerStudio: 1, powerBi: 1, tableau: 1,
      dashboardsAutomaticos: 1, integracaoMultiplasFontesDados: 1, relatoriosAgendadosAutomaticamente: 1,
      googleSheetsScripts: 1,
    },
    ferramentasColaboracao: {
      slack: 1, microsoftTeams: 1, discord: 1,
      notionBaseConhecimento: 1, googleWorkspace: 1, asanaTrelloMonday: 1,
    },
    ecommercePagamentos: {
      integracaoGatewaysPagamento: 1, stripe: 1, paypal: 1,
      mercadoPago: 1, pagSeguro: 1, automacaoCarrinhoAbandonado: 1,
      upsellCrossSellAutomatizados: 1,
    },
    automacaoEmail: {
      sequenciasNutricao: 1, segmentacaoDinamica: 1, triggersComportamentais: 1,
      abTestingAutomatizado: 1, reEngajamentoAutomatico: 1, integracaoEventosSite: 1,
    },
    ferramentasProdutividade: {
      loom: 1, calendly: 1, typeformGoogleForms: 1,
      docusignAssinaturasDigitais: 1, notionCodaDocumentacao: 1, airtableBancoDadosVisual: 1,
    },
    seoTecnicoFerramentas: {
      googleSearchConsole: 1, semrushAhrefs: 1, screamingFrog: 1,
      schemaMarkup: 1, sitemapXml: 1, robotsTxt: 1,
      coreWebVitals: 1,
    },
    segurancaCompliance: {
      lgpd: 1, cookiesConsentimento: 1, politicasPrivacidade: 1,
      segurancaDadosClientes: 1, autenticacaoDoisFatores: 1, firewallProtecaoMalware: 1,
    },
    analyticsTagManagement: {
      googleAnalytics4: 1, googleTagManager: 1, facebookPixel: 1,
      hotjarCrazyEgg: 1, mixpanel: 1, configuracaoEventosCustomizados: 1,
    },
    automacaoPropostasContratos: {
      pandadoc: 1, proposify: 1, docusign: 1,
      hellosign: 1, templatesAutomatizados: 1, followUpAutomaticoPropostas: 1,
    },
    gestaoFinanceiraAutomatizada: {
      integracaoBancaria: 1, emissaoNotasFiscaisAutomaticas: 1, cobrancasRecorrentes: 1,
      controleFluxoCaixa: 1, ferramentasContaAzulOmieBling: 1,
    },
    backupRecuperacao: {
      backupAutomaticoSites: 1, backupDadosCrm: 1, versionamentoArquivos: 1,
      planoDisasterRecovery: 1, cloudBackup: 1,
    },
  },
  habilidadesComplementares: {
    gestaoProjetos: {
      metodologiasAgeis: 1, trelloAsanaMonday: 1, gestaoPrazos: 1,
      briefingDebriefing: 1, gestaoEquipe: 1,
    },
    atendimentoCliente: {
      relacionamentoCliente: 1, apresentacoesComerciais: 1, negociacao: 1,
      propostasComerciais: 1,
    },
    outrasSkills: {
      fotografiaBasica: 1, edicaoVideo: 1, producaoAudiovisual: 1,
      audioPodcast: 1, nocoesProgramacao: 1,
    },
  },
  softSkills: {
    criatividade: 1, comunicacao: 1, trabalhoEmEquipe: 1,
    gestaoDeTempo: 1, proatividade: 1, resolucaoDeProblemas: 1,
    adaptabilidade: 1, atencaoAosDetalhes: 1, sensoDeUrgencia: 1,
    capacidadeAnalitica: 1,
  },
};


const MultiStepQuestionnaire: React.FC<MultiStepQuestionnaireProps> = ({ candidateInfo, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isReviewing, setIsReviewing] = useState(false);

  // Scroll para o topo quando mudar de step
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]); 
  
  const methods = useForm<QuestionnaireSchema>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: defaultValues,
  });

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNavigateToStep = (stepIndex: number, reviewMode: boolean) => {
    setCurrentStep(stepIndex);
    setIsReviewing(reviewMode);
  };

  const handleNext = async () => {
    const currentStepId = steps[currentStep].id;
    
    // Validação da etapa atual (exceto para o resumo)
    if (currentStepId !== "summary") {
      const isValid = await methods.trigger(currentStepId as keyof QuestionnaireSchema, { shouldFocus: true });
      
      if (!isValid) {
        toast({
          title: "Erro de validação",
          description: "Por favor, preencha todos os campos obrigatórios antes de continuar.",
          variant: "destructive",
        });
        return;
      }
    }

    if (isReviewing) {
      // Se estiver revisando, volta diretamente para o resumo (última etapa)
      setCurrentStep(totalSteps - 1);
      setIsReviewing(false); // Desativa o modo de revisão após o retorno
    } else if (currentStep < totalSteps - 1) {
      // Se não estiver revisando, avança normalmente
      setCurrentStep((prev) => prev + 1);
    }
    // REMOVIDO: Não submete automaticamente na última etapa
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      // Se voltar do resumo, desativa o modo de revisão
      if (currentStep === totalSteps - 1) {
        setIsReviewing(false);
      }
    }
  };

  // Hooks para o novo sistema
  const createCandidate = useCreateCandidate();
  const submitAssessment = useSubmitAssessment();
  const { data: subjects } = useActiveSubjects();

  const onSubmit = async (data: QuestionnaireSchema) => {
    if (!candidateInfo) {
      showError("Erro: Informações do candidato não encontradas. Por favor, recomece.");
      return;
    }

    const loadingToastId = showLoading("Enviando questionário...");

    try {
      // 1. Criar/buscar candidato
      const candidateData: CandidateFormData = {
        email: candidateInfo.email,
        full_name: candidateInfo.name,
        phone: candidateInfo.phone,
        education_level: candidateInfo.areaOfExpertise,
        experience_years: candidateInfo.yearsOfExperience,
        consent_data_processing: true,
        consent_marketing: false
      };

      const candidate = await createCandidate.mutateAsync(candidateData);

      // 2. Converter respostas do questionário para o novo formato
      const answers: QuestionnaireAnswer[] = [];
      let questionNumber = 1;

      // Mapear cada seção do questionário para respostas
      Object.entries(data).forEach(([sectionKey, sectionData]) => {
        if (typeof sectionData === 'object' && sectionData !== null) {
          Object.entries(sectionData).forEach(([questionKey, answer]) => {
            // Encontrar a matéria correspondente (mapear seções para matérias)
            const subjectName = mapSectionToSubject(sectionKey);
            const subject = subjects?.find(s => s.name === subjectName);
            
            if (subject && answer !== undefined) {
              answers.push({
                subject_id: subject.id,
                question_number: questionNumber++,
                question_text: `${sectionKey}: ${questionKey}`,
                answer_value: String(answer),
                answer_score: typeof answer === 'number' ? answer : 0,
                is_correct: typeof answer === 'number' ? answer > 0 : true,
                time_spent_seconds: 30 // Estimativa
              });
            }
          });
        }
      });

      // 3. Submeter avaliação
      const assessmentData: AssessmentSubmission = {
        candidate_id: candidate.id,
        answers: answers,
        time_spent_minutes: Math.ceil(answers.length * 0.5), // Estimativa
      };

      await submitAssessment.mutateAsync(assessmentData);

      dismissToast(loadingToastId);
      showSuccess("🎉 Questionário enviado com sucesso! Agradecemos sua participação.");
      
      // Mostrar mensagem adicional de agradecimento
      setTimeout(() => {
        showSuccess("✨ Agora você pode compartilhar mais sobre você!");
      }, 1500);
      
      // Aguardar um pouco para o usuário ver as mensagens, depois redirecionar
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(candidate.id);
        }
      }, 3000); // 3 segundos total para ler as mensagens
      
    } catch (error: any) {
      dismissToast(loadingToastId);
      console.error("Erro ao salvar questionário:", error);
      
      // Mensagem de erro mais específica
      let errorMessage = "Erro ao finalizar o questionário. Tente novamente.";
      
      if (error.message?.includes('ERR_CONNECTION_CLOSED') || error.message?.includes('network')) {
        errorMessage = "Problema de conexão. Verifique sua internet e tente novamente.";
      } else if (error.message?.includes('duplicate key')) {
        errorMessage = "Dados já existem. Tentando atualizar...";
      }
      
      showError(errorMessage);
    }
  };

  // Função para mapear seções do questionário para matérias do banco
  const mapSectionToSubject = (sectionKey: string): string => {
    const mapping: Record<string, string> = {
      'brandingRebranding': 'Criatividade',
      'copywriting': 'Comunicação',
      'redacao': 'Comunicação',
      'arteDesign': 'Criatividade',
      'midiaSocial': 'Comunicação',
      'landingPages': 'Conhecimento Técnico',
      'publicidade': 'Comunicação',
      'marketing': 'Conhecimento Técnico',
      'tecnologiaAutomacoes': 'Conhecimento Técnico',
      'habilidadesComplementares': 'Adaptabilidade',
      'softSkills': 'Inteligência Emocional'
    };
    
    return mapping[sectionKey] || 'Raciocínio Lógico';
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <FormProvider {...methods}>
      <div className="w-full max-w-2xl mx-auto">
        {/* Progress Header */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 mb-8">
          <div className="space-y-4">
            <Progress 
              value={progress} 
              className="w-full h-3 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-blue-500" 
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Etapa {currentStep + 1} de {totalSteps}
              </span>
              <span className="font-medium text-foreground">
                {steps[currentStep].name}
              </span>
              <span className="text-muted-foreground">
                {Math.round(progress)}% concluído
              </span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-xl p-8 md:p-12">
            {/* Renderiza o componente do passo atual */}
            {steps[currentStep].id === "summary" ? (
              <SummaryStep onNavigateToStep={handleNavigateToStep} />
            ) : (
              <CurrentStepComponent />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center bg-card/30 backdrop-blur-sm border border-border/50 rounded-xl p-6">
          {currentStep > 0 && currentStep !== totalSteps - 1 && (
            <Button
              type="button"
              onClick={handleBack}
              variant="outline"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 border-inclusive-blue"
            >
              Voltar
            </Button>
          )}
            <Button
              type="button"
              onClick={currentStep === totalSteps - 1 ? methods.handleSubmit(onSubmit) : handleNext}
              className="ml-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              {currentStep === totalSteps - 1 ? "Finalizar Questionário" : (isReviewing ? "Voltar ao Resumo" : "Próximo")}
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
};

export default MultiStepQuestionnaire;