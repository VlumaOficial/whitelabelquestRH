import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { useAssessmentAnswers } from "@/hooks/useSupabase";

interface AssessmentAnswersModalProps {
  assessmentId: string | null;
  onClose: () => void;
}

export default function AssessmentAnswersModal({ assessmentId, onClose }: AssessmentAnswersModalProps) {
  const { data: answers, isLoading } = useAssessmentAnswers(assessmentId || '');

  if (!assessmentId) return null;

  // Agrupar respostas por matéria
  const answersBySubject = answers?.reduce((acc, answer) => {
    const subjectName = answer.subject_name || 'Geral';
    if (!acc[subjectName]) {
      acc[subjectName] = [];
    }
    acc[subjectName].push(answer);
    return acc;
  }, {} as Record<string, typeof answers>) || {};

  return (
    <Dialog open={!!assessmentId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Respostas do Questionário</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          {isLoading ? (
            <div className="text-center py-8">Carregando respostas...</div>
          ) : (
            <div className="space-y-6">
              {Object.entries(answersBySubject).map(([subjectName, subjectAnswers]) => (
                <Card key={subjectName}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      {subjectName}
                      <Badge variant="outline">
                        {subjectAnswers?.filter(a => a.is_correct).length || 0}/{subjectAnswers?.length || 0} corretas
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {subjectAnswers?.map((answer, index) => (
                        <div key={answer.id} className={`border-l-4 pl-4 ${answer.is_correct ? 'border-l-green-500' : 'border-l-red-500'}`}>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                Questão {answer.question_number}
                              </span>
                              {answer.is_correct ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              {answer.time_spent_seconds && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  {answer.time_spent_seconds}s
                                </div>
                              )}
                            </div>
                            <p className="text-sm mb-2">{answer.question_text}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Resposta:</span>
                              <Badge 
                                variant={answer.is_correct ? "default" : "destructive"}
                                className="text-xs"
                              >
                                {answer.answer_value}
                              </Badge>
                              {answer.answer_score && (
                                <span className="text-xs text-muted-foreground">
                                  ({answer.answer_score} pontos)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
