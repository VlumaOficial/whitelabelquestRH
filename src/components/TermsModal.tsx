import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms' | 'how-it-works';
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, type }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      let filename = 'termos-de-uso.md';
      
      if (type === 'privacy') {
        filename = 'politica-de-privacidade.md';
      } else if (type === 'how-it-works') {
        filename = 'como-funciona.md';
      }
      
      fetch(`/${filename}`)
        .then(response => response.text())
        .then(text => {
          setContent(text);
          setLoading(false);
        })
        .catch(error => {
          console.error('Erro ao carregar documento:', error);
          setContent('Erro ao carregar o documento. Por favor, tente novamente.');
          setLoading(false);
        });
    }
  }, [isOpen, type]);

  const getTitle = () => {
    switch (type) {
      case 'privacy':
        return 'Política de Privacidade';
      case 'how-it-works':
        return 'Como Funciona';
      default:
        return 'Termos de Uso';
    }
  };

  const title = getTitle();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-inclusive-purple">
            {title}
          </DialogTitle>
          <DialogDescription>
            Por favor, leia atentamente o documento abaixo
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] w-full rounded-md border p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Carregando documento...</div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {content}
              </pre>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TermsModal;
