import MultiStepQuestionnaire from "@/components/MultiStepQuestionnaire";
import CandidateForm from "@/components/CandidateForm";
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
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [candidateInfo, setCandidateInfo] = useState<CandidateData | null>(null);

  const handleCandidateFormSubmit = (data: CandidateData) => {
    setCandidateInfo(data);
    setShowQuestionnaire(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {!showQuestionnaire ? (
        <CandidateForm onFormSubmitSuccess={handleCandidateFormSubmit} />
      ) : (
        <MultiStepQuestionnaire candidateInfo={candidateInfo} />
      )}
    </div>
  );
};

export default Index;