import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  name: string;
  completed?: boolean;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function ProgressIndicator({ steps, currentStep, className }: ProgressIndicatorProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Mobile Progress Bar */}
      <div className="md:hidden mb-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>Progresso</span>
          <span>{currentStep + 1} de {steps.length}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop Step Indicator */}
      <div className="hidden md:flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                index < currentStep 
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 border-purple-600 text-white"
                  : index === currentStep
                  ? "border-purple-600 bg-purple-50 dark:bg-purple-950/30 text-purple-600"
                  : "border-muted-foreground/30 bg-muted text-muted-foreground"
              )}>
                {index < currentStep ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>
              
              {/* Step Name */}
              <span className={cn(
                "text-xs mt-2 text-center max-w-20 leading-tight transition-colors",
                index <= currentStep 
                  ? "text-foreground font-medium" 
                  : "text-muted-foreground"
              )}>
                {step.name}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-4 transition-colors duration-300",
                index < currentStep 
                  ? "bg-gradient-to-r from-purple-600 to-blue-600" 
                  : "bg-muted-foreground/30"
              )} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
