"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor, insira um email válido.",
  }),
  phone: z.string().min(10, {
    message: "Por favor, insira um número de telefone válido.",
  }),
  areaOfExpertise: z.string().min(2, {
    message: "A área de atuação deve ter pelo menos 2 caracteres.",
  }),
  yearsOfExperience: z.coerce.number().min(0, {
    message: "O tempo de experiência deve ser um número positivo.",
  }),
});

type CandidateFormData = z.infer<typeof formSchema>;

interface CandidateFormProps {
  onFormSubmitSuccess: (data: CandidateFormData) => void;
}

const CandidateForm: React.FC<CandidateFormProps> = ({ onFormSubmitSuccess }) => {
  const form = useForm<CandidateFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      areaOfExpertise: "",
      yearsOfExperience: 0,
    },
  });

  function onSubmit(values: CandidateFormData) {
    console.log("Dados do Candidato:", values);
    toast({
      title: "Informações do candidato enviadas!",
      description: "Agora, por favor, preencha o questionário de habilidades.",
    });
    onFormSubmitSuccess(values); // Chama o callback para avançar para o próximo formulário, passando os dados
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl shadow-lg border-inclusive-blue">
        <CardHeader className="text-center bg-inclusive-purple/10">
          <CardTitle className="text-3xl font-bold text-inclusive-purple">Questionário de Candidato</CardTitle>
          <p className="text-muted-foreground mt-2">Por favor, preencha suas informações e leia as instruções.</p>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="seu.email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Telefone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="(XX) XXXXX-XXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="areaOfExpertise"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Área de Atuação</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Desenvolvimento Web, Design UX/UI" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="yearsOfExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Tempo de Experiência (anos)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field} 
                        onChange={event => {
                          const value = event.target.value;
                          field.onChange(value === '' ? 0 : parseFloat(value) || 0);
                        }} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="mt-8 p-4 bg-inclusive-yellow/10 rounded-md border border-inclusive-orange">
                <h2 className="text-xl font-semibold text-inclusive-blue mb-3">Instruções de Avaliação</h2>
                <p className="text-muted-foreground mb-2">Você avaliará cada habilidade de 1 a 5:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li><strong className="text-inclusive-blue">1</strong> - Sem conhecimento</li>
                  <li><strong className="text-inclusive-blue">2</strong> - Conhecimento básico</li>
                  <li><strong className="text-inclusive-blue">3</strong> - Conhecimento intermediário</li>
                  <li><strong className="text-inclusive-blue">4</strong> - Conhecimento avançado</li>
                  <li><strong className="text-inclusive-blue">5</strong> - Especialista/Expert</li>
                </ul>
              </div>

              <Button type="submit" className="w-full bg-inclusive-orange text-inclusive-orange-foreground hover:bg-inclusive-orange/90">
                Continuar para o Questionário de Habilidades
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidateForm;