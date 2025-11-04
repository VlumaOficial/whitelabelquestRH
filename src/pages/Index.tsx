import { MadeWithDyad } from "@/components/made-with-dyad";
import MultiStepQuestionnaire from "@/components/MultiStepQuestionnaire";
import CandidateForm from "@/components/CandidateForm";
import React, { useState } from "react";

const Index = () => {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  const handleCandidateFormSubmit = () => {
    setShowQuestionnaire(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {!showQuestionnaire ? (
        <CandidateForm onFormSubmitSuccess={handleCandidateFormSubmit} />
      ) : (
        <MultiStepQuestionnaire />
      )}
      <MadeWithDyad />
    </div>
  );
};

export default Index;