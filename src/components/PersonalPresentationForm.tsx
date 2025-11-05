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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Briefcase, 
  Heart, 
  Target, 
  Linkedin, 
  Globe, 
  Github, 
  Instagram,
  Palette,
  Sparkles
} from "lucide-react";
import type { PersonalPresentationData } from "@/types/database";

const presentationSchema = z.object({
  personal_presentation: z.string()
    .min(50, "A apresentação pessoal deve ter pelo menos 50 caracteres")
    .max(1000, "A apresentação pessoal deve ter no máximo 1000 caracteres")
    .optional(),
  additional_skills: z.string()
    .max(500, "Máximo 500 caracteres")
    .optional(),
  highlighted_soft_skills: z.string()
    .max(500, "Máximo 500 caracteres")
    .optional(),
  relevant_experiences: z.string()
    .max(800, "Máximo 800 caracteres")
    .optional(),
  professional_goals: z.string()
    .max(500, "Máximo 500 caracteres")
    .optional(),
  linkedin_url: z.string()
    .url("URL inválida")
    .refine((url) => url.includes("linkedin.com"), "Deve ser uma URL do LinkedIn")
    .optional()
    .or(z.literal("")),
  portfolio_url: z.string()
    .url("URL inválida")
    .optional()
    .or(z.literal("")),
  github_url: z.string()
    .url("URL inválida")
    .refine((url) => url.includes("github.com"), "Deve ser uma URL do GitHub")
    .optional()
    .or(z.literal("")),
  behance_url: z.string()
    .url("URL inválida")
    .refine((url) => url.includes("behance.net") || url.includes("dribbble.com"), "Deve ser uma URL do Behance ou Dribbble")
    .optional()
    .or(z.literal("")),
  instagram_url: z.string()
    .url("URL inválida")
    .refine((url) => url.includes("instagram.com"), "Deve ser uma URL do Instagram")
    .optional()
    .or(z.literal("")),
});

type PresentationFormData = z.infer<typeof presentationSchema>;

interface PersonalPresentationFormProps {
  candidateName: string;
  onSubmit: (data: PersonalPresentationData) => void;
  onSkip: () => void;
  isLoading?: boolean;
}

export default function PersonalPresentationForm({ 
  candidateName, 
  onSubmit, 
  onSkip, 
  isLoading = false 
}: PersonalPresentationFormProps) {
  const form = useForm<PresentationFormData>({
    resolver: zodResolver(presentationSchema),
    defaultValues: {
      personal_presentation: "",
      additional_skills: "",
      highlighted_soft_skills: "",
      relevant_experiences: "",
      professional_goals: "",
      linkedin_url: "",
      portfolio_url: "",
      github_url: "",
      behance_url: "",
      instagram_url: "",
    },
  });

  const handleSubmit = (values: PresentationFormData) => {
    // Filtrar campos vazios
    const filteredData = Object.fromEntries(
      Object.entries(values).filter(([_, value]) => value && typeof value === 'string' && value.trim() !== "")
    ) as PersonalPresentationData;
    
    onSubmit(filteredData);
  };

  const watchedPresentation = form.watch("personal_presentation");
  const presentationLength = watchedPresentation?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800 dark:text-purple-300">
              Etapa Final
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient-diversity">Conte-nos mais sobre você, {candidateName}!</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Esta é sua oportunidade de se destacar! Compartilhe suas experiências, 
            habilidades e objetivos que não foram cobertos no questionário.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {/* Apresentação Pessoal */}
            <Card className="border-inclusive-purple/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-inclusive-purple">
                  <User className="w-5 h-5" />
                  Apresentação Pessoal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="personal_presentation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conte sua história profissional *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Sou um profissional apaixonado por marketing digital com 5 anos de experiência. Especializo-me em campanhas criativas que conectam marcas com pessoas..."
                          className="min-h-[120px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <div className="flex justify-between items-center">
                        <FormDescription>
                          Descreva sua trajetória, paixões e o que te motiva profissionalmente
                        </FormDescription>
                        <Badge variant={presentationLength > 800 ? "destructive" : "secondary"}>
                          {presentationLength}/1000
                        </Badge>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Habilidades e Experiências */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-inclusive-blue/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-inclusive-blue">
                    <Briefcase className="w-5 h-5" />
                    Habilidades Técnicas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="additional_skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Habilidades adicionais</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Adobe Creative Suite, Google Analytics, Python, SEO avançado..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Ferramentas, tecnologias ou conhecimentos específicos
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="border-inclusive-green/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-inclusive-green">
                    <Heart className="w-5 h-5" />
                    Soft Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="highlighted_soft_skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Suas principais soft skills</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Liderança empática, comunicação assertiva, pensamento estratégico..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Qualidades pessoais que te destacam
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Experiências e Objetivos */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-inclusive-orange/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-inclusive-orange">
                    <Sparkles className="w-5 h-5" />
                    Experiências Relevantes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="relevant_experiences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Projetos ou experiências marcantes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Liderei campanha que aumentou engajamento em 300%, criei identidade visual para startup..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Conquistas, projetos ou experiências que demonstram seu potencial
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="border-inclusive-purple/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-inclusive-purple">
                    <Target className="w-5 h-5" />
                    Objetivos Profissionais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="professional_goals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Onde você se vê profissionalmente?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Busco crescer como estrategista digital, liderar equipes criativas, empreender na área de inovação..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Suas aspirações e objetivos de carreira
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Links e Redes Sociais */}
            <Card className="border-inclusive-teal/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-inclusive-teal">
                  <Globe className="w-5 h-5" />
                  Seus Links Profissionais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="linkedin_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Linkedin className="w-4 h-4 text-blue-600" />
                          LinkedIn
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://linkedin.com/in/seu-perfil"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="portfolio_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-green-600" />
                          Portfólio/Site
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://seu-portfolio.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="github_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Github className="w-4 h-4 text-gray-800 dark:text-gray-200" />
                          GitHub
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://github.com/seu-usuario"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="behance_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Palette className="w-4 h-4 text-blue-500" />
                          Behance/Dribbble
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://behance.net/seu-perfil"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="instagram_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Instagram className="w-4 h-4 text-pink-600" />
                          Instagram Profissional
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://instagram.com/seu-perfil"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center bg-card/30 backdrop-blur-sm border border-border/50 rounded-xl p-6">
              <Button
                type="button"
                variant="outline"
                onClick={onSkip}
                className="w-full sm:w-auto"
                disabled={isLoading}
              >
                Pular Esta Etapa
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Salvando..." : "Finalizar Apresentação"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
