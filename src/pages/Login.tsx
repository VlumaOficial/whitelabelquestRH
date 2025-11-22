import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useClientConfig } from '@/config/client';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, ArrowRight, Users } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const config = useClientConfig();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validação básica
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      setIsLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Por favor, insira um email válido.');
      setIsLoading(false);
      return;
    }

    try {
      // Chamar função do Supabase para verificar login admin
      const { data, error: loginError } = await supabase
        .rpc('verify_admin_login', {
          p_email: email,
          p_password: password
        });

      if (loginError) {
        console.error('Erro ao fazer login:', loginError);
        setError("Erro ao conectar com o servidor. Tente novamente.");
        setIsLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setError("Email ou senha incorretos.");
        setIsLoading(false);
        return;
      }

      const user = data[0];

      if (!user.is_active) {
        setError("Usuário inativo. Entre em contato com o administrador.");
        setIsLoading(false);
        return;
      }

      // Salvar dados do usuário no localStorage
      localStorage.setItem('adminUser', JSON.stringify(user));
      localStorage.setItem('adminToken', user.id);

      // Redirecionar direto para dashboard administrativo
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Erro no login:', err);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo e Título */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600 via-blue-600 to-orange-500 rounded-xl flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Acesso ao Sistema {config.company.name}
            </h1>
            <p className="text-muted-foreground mb-8">
              Entre com suas credenciais para acessar o painel administrativo
            </p>
          </div>

          {/* Card de Login */}
          <Card className="border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Acesso Administrativo</CardTitle>
              <CardDescription>
                Entre com suas credenciais para acessar o painel de controle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-orange-600 via-blue-600 to-orange-500 hover:from-orange-700 hover:via-blue-700 hover:to-orange-600"
                  disabled={isLoading}
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>

              <div className="text-center text-sm text-muted-foreground">
                <p>Não tem uma conta? Entre em contato conosco</p>
                <p className="mt-1">
                  <a 
                    href={`mailto:${config.company.contact.email}`}
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    {config.company.contact.email}
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
