import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface AnimatedContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "fade";
}

export function AnimatedContainer({ 
  children, 
  className, 
  delay = 0, 
  direction = "up" 
}: AnimatedContainerProps) {
  const getAnimationClass = () => {
    switch (direction) {
      case "up":
        return "animate-in slide-in-from-bottom-4";
      case "down":
        return "animate-in slide-in-from-top-4";
      case "left":
        return "animate-in slide-in-from-right-4";
      case "right":
        return "animate-in slide-in-from-left-4";
      case "fade":
        return "animate-in fade-in";
      default:
        return "animate-in slide-in-from-bottom-4";
    }
  };

  return (
    <div 
      className={cn(
        getAnimationClass(),
        "duration-700 ease-out",
        className
      )}
      style={{ 
        animationDelay: `${delay}ms`,
        animationFillMode: "both"
      }}
    >
      {children}
    </div>
  );
}
