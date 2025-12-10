import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md mx-4 shadow-lg border border-border/60 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <CardContent className="pt-6 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
              404 — Not Found
            </h1>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            A página que você tentou acessar não existe ou foi movida.
            <br />
            Se você está desenvolvendo, talvez falte registrar a rota no sistema.
          </p>

          <div className="mt-6 flex justify-end">
            <Link href="/dashboard">
              <Button className="rounded-full px-6 transition-transform hover:scale-105">
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
