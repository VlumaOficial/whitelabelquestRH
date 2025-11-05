import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDatabaseHealth, useSystemStats } from "@/hooks/useSupabase";
import { 
  CheckCircle, 
  AlertCircle, 
  Database, 
  RefreshCw,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";

export function DatabaseStatus() {
  const [copied, setCopied] = useState(false);
  const { data: isHealthy, isLoading, refetch } = useDatabaseHealth();
  const { data: stats } = useSystemStats();

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const hasCredentials = supabaseUrl && import.meta.env.VITE_SUPABASE_ANON_KEY;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = () => {
    if (isLoading) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30";
    if (isHealthy) return "bg-green-100 text-green-800 dark:bg-green-900/30";
    return "bg-red-100 text-red-800 dark:bg-red-900/30";
  };

  const getStatusIcon = () => {
    if (isLoading) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (isHealthy) return <CheckCircle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (isLoading) return "Verificando...";
    if (isHealthy) return "Conectado";
    return "Desconectado";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Status do Banco de Dados
        </CardTitle>
        <CardDescription>
          Verificação da conectividade e saúde do Supabase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Principal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className={getStatusColor()}>
              {getStatusIcon()}
              {getStatusText()}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Verificar Novamente
            </Button>
          </div>
        </div>

        {/* Informações de Conexão */}
        {hasCredentials ? (
          <div className="space-y-3">
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">URL do Projeto:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(supabaseUrl)}
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(supabaseUrl, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <code className="text-xs text-muted-foreground break-all">
                {supabaseUrl}
              </code>
            </div>

            {/* Estatísticas do Banco */}
            {isHealthy && stats && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <div className="text-lg font-bold">{stats.total_candidates}</div>
                  <div className="text-xs text-muted-foreground">Candidatos</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <div className="text-lg font-bold">{stats.total_assessments}</div>
                  <div className="text-xs text-muted-foreground">Avaliações</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Configuração Necessária:</strong> As credenciais do Supabase não foram encontradas. 
              Configure o arquivo <code>.env.local</code> com suas credenciais.
            </AlertDescription>
          </Alert>
        )}

        {/* Instruções de Configuração */}
        {!isHealthy && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <strong>Como configurar o banco:</strong>
                <ol className="list-decimal list-inside text-sm space-y-1 ml-4">
                  <li>Execute os comandos SQL do arquivo <code>database_setup.sql</code></li>
                  <li>Configure as credenciais no arquivo <code>.env.local</code></li>
                  <li>Reinicie o servidor de desenvolvimento</li>
                  <li>Clique em "Verificar Novamente"</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Links Úteis */}
        <div className="pt-3 border-t">
          <div className="text-sm font-medium mb-2">Links Úteis:</div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Supabase Dashboard
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/admin', '_blank')}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Dashboard Admin
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
