import MultiStepQuestionnaire from "@/components/MultiStepQuestionnaire";
import CandidateForm from "@/components/CandidateForm";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/layout/Hero";
import { Footer } from "@/components/layout/Footer";
import React, { useState } from "react";

// Definindo o tipo para os dados do candidato
interface CandidateData {
  name: string;
  email: string;
  phone: string;
  areaOfExpertise: string;
  yearsOfExperience: number;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState<'hero' | 'form' | 'questionnaire'>('hero');
  const [candidateInfo, setCandidateInfo] = useState<CandidateData | null>(null);

  const handleStartJourney = () => {
    setCurrentStep('form');
  };

  const handleCandidateFormSubmit = (data: CandidateData) => {
    setCandidateInfo(data);
    setCurrentStep('questionnaire');
  };

  const handleBackToStart = () => {
    setCurrentStep('hero');
    setCandidateInfo(null);
  };

  const handleQuestionnaireSuccess = () => {
    // Voltar para a tela principal após sucesso
    setCurrentStep('hero');
    setCandidateInfo(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="flex-1">
        {currentStep === 'hero' && (
          <Hero onStartJourney={handleStartJourney} />
        )}
        
        {currentStep === 'form' && (
          <div className="container mx-auto px-4 py-12 max-w-2xl">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold mb-4">Vamos nos conhecer!</h2>
              <p className="text-muted-foreground">
                Conte-nos um pouco sobre você para personalizarmos sua experiência.
              </p>
            </div>
            <CandidateForm onFormSubmitSuccess={handleCandidateFormSubmit} />
          </div>
        )}
        
        {currentStep === 'questionnaire' && candidateInfo && (
          <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
            <div className="container mx-auto px-4 py-12">
              {/* Header do Questionário */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full mb-4">
                  <span className="text-sm font-medium text-purple-800 dark:text-purple-300">
                    ✨ Avaliação Personalizada
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  <span className="text-gradient-diversity">Olá, {candidateInfo.name}!</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Agora vamos descobrir suas habilidades únicas através de uma jornada 
                  personalizada e inclusiva.
                </p>
              </div>

              {/* Questionário */}
              <div className="max-w-3xl mx-auto">
                <MultiStepQuestionnaire 
                  candidateInfo={candidateInfo}
                  onBack={handleBackToStart}
                  onSuccess={handleQuestionnaireSuccess}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {currentStep === 'hero' && <Footer />}
    </div>
  );
};

export default Index;