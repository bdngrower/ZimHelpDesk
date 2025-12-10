import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import logo from "@assets/generated_images/modern_abstract_logo_for_a_help_desk_software.png";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { signIn } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (
      form.elements.namedItem("password") as HTMLInputElement
    ).value;

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setLocation("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-muted/40 to-background p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        {/* Logo + título */}
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-sm ring-1 ring-primary/30">
            <img
              src={logo}
              alt="Logo"
              className="h-12 w-12 rounded-xl shadow-sm"
            />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
            Seja Bem-vindo
          </h1>
          <p className="max-w-xs text-sm text-muted-foreground">
            Entre com suas credenciais para acessar o portal de atendimento.
          </p>
        </div>

        {/* Card de login */}
        <Card className="border border-border/70 bg-card/90 shadow-lg backdrop-blur-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Entrar</CardTitle>
            <CardDescription className="text-sm">
              Use o seu e-mail corporativo para continuar.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  className="rounded-lg bg-muted/40 shadow-none transition-colors focus-visible:bg-background"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <Label htmlFor="password">Senha</Label>
                  <Link
                    href="#"
                    className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="rounded-lg bg-muted/40 shadow-none transition-colors focus-visible:bg-background"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <p>{error}</p>
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button
                className="w-full rounded-full font-medium shadow-sm transition-transform duration-150 hover:scale-[1.02]"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Rodapé */}
        <p className="text-center text-sm text-muted-foreground">
          Ainda não tem uma conta?{" "}
          <Link
            href="#"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Fale com o administrador
          </Link>
        </p>
      </div>
    </div>
  );
}
