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
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setLocation("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 rounded-xl bg-primary/10 p-3">
            <img src={logo} alt="Logo" className="h-12 w-12 rounded-lg shadow-sm" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
            Seja Bem-Vindo
          </h1>
          <p className="mt-2 text-muted-foreground">
            Enter your credentials to access the agent portal
          </p>
        </div>

        <Card className="border-muted/60 shadow-lg">
          <CardHeader>
            <CardTitle>Entrar</CardTitle>
            <CardDescription>
              Use o seu e-mail corporativo para continuar
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  className="bg-muted/30"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link href="#" className="text-xs text-primary hover:underline">
                    Esqueceu sua Senha?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="bg-muted/30"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <p>{error}</p>
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button className="w-full font-medium" size="lg" disabled={isLoading}>
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

        <p className="text-center text-sm text-muted-foreground">
          Ainda não tem uma conta?{" "}
          <Link href="#" className="font-medium text-primary hover:underline">
            Contact your administrator
          </Link>
        </p>
      </div>
    </div>
  );
}
