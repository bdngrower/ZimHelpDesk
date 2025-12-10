import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Ticket,
  Users,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  Languages,
  BarChart3,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import logo from "@assets/generated_images/modern_abstract_logo_for_a_help_desk_software.png";
import { useLanguage } from "@/context/language-context";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);
  const { t, language, setLanguage } = useLanguage();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  // Perfil do usuário logado
  const { data: profile } = useQuery({
    queryKey: ["current_profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .eq("id", user!.id)
        .single();

      if (error) throw error;
      return data as {
        id: string;
        full_name: string | null;
        email: string | null;
        avatar_url: string | null;
      };
    },
  });

  const displayName =
    profile?.full_name ||
    user?.email?.split("@")[0] ||
    "Usuário";
  const displayEmail = profile?.email || user?.email || "";
  const avatarUrl =
    profile?.avatar_url ||
    (displayName
      ? `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(
          displayName,
        )}`
      : undefined);

  const NavItem = ({
    href,
    icon: Icon,
    label,
  }: {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }) => {
    const isActive =
      location === href || location.startsWith(href + "/");

    return (
      <Link href={href}>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className={`group w-full justify-start gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-150
            ${
              isActive
                ? "bg-primary/10 text-primary font-semibold shadow-sm ring-1 ring-primary/20"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            }`}
        >
          <span
            className={`h-5 w-1 rounded-full transition-colors ${
              isActive
                ? "bg-primary"
                : "bg-transparent group-hover:bg-muted-foreground/40"
            }`}
          />
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </Button>
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-4">
      {/* Logo / Topo */}
      <div className="flex h-16 items-center border-b bg-gradient-to-r from-primary/10 via-background to-background dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-display text-xl font-bold tracking-tight"
        >
          <img
            src={logo}
            alt="Logo"
            className="h-8 w-8 rounded-lg shadow-sm ring-1 ring-primary/30"
          />
          <span className="flex items-baseline gap-1">
            <span>HelpDesk</span>
            <span className="text-primary">Pro</span>
          </span>
        </Link>
      </div>

      {/* Navegação */}
      <div className="flex-1 px-3 py-2">
        <nav className="flex flex-col gap-1">
          <NavItem
            href="/dashboard"
            icon={LayoutDashboard}
            label={t("nav.dashboard")}
          />
          <NavItem href="/tickets" icon={Ticket} label={t("nav.tickets")} />
          <NavItem
            href="/reports"
            icon={BarChart3}
            label={t("nav.reports")}
          />
          <NavItem
            href="/customers"
            icon={Users}
            label={t("nav.customers")}
          />
          <NavItem
            href="/settings"
            icon={Settings}
            label={t("nav.settings")}
          />
        </nav>
      </div>

      {/* Usuário logado */}
      <div className="border-t px-4 pb-4 pt-3">
        <div className="group flex items-center gap-3 rounded-2xl border bg-card/80 p-3 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-card hover:shadow-md">
          <Avatar className="h-9 w-9 border">
            {avatarUrl && <AvatarImage src={avatarUrl} />}
            <AvatarFallback>
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">
              {displayName}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {displayEmail}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const handleNotificationsClick = () => {
    setHasNotifications(false);
    toast({
      title: "Central de notificações",
      description: "Em breve você verá notificações reais aqui. 😉",
    });
  };

  const handleLogout = async () => {
    await signOut();
    // volta sempre para a raiz do domínio atual
    window.location.href = window.location.origin;
  };

  const goToProfile = () => {
    setLocation("/settings#profile");
  };

  const goToSettings = () => {
    setLocation("/settings");
  };

  return (
    <div className="min-h-screen bg-muted/30 dark:bg-slate-950 md:grid md:grid-cols-[240px_1fr]">
      {/* Sidebar Desktop */}
      <aside className="hidden border-r bg-background/95 dark:bg-slate-900/90 backdrop-blur-sm md:block">
        <SidebarContent />
      </aside>

      {/* Conteúdo Principal */}
      <div className="flex h-screen flex-col overflow-hidden">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 flex-none items-center gap-4 border-b bg-background/80 dark:bg-slate-900/80 px-4 md:px-6 backdrop-blur-md">
          {/* Menu Mobile */}
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[240px] p-0 bg-background dark:bg-slate-950"
            >
              <SidebarContent />
            </SheetContent>
          </Sheet>

          {/* Busca */}
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("search.placeholder")}
                className="w-full rounded-2xl bg-muted/60 pl-9 text-sm shadow-none transition-colors focus-visible:bg-background dark:bg-slate-800/70 dark:focus-visible:bg-slate-900"
              />
            </div>
          </div>

          {/* Ações direita */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Idioma */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                >
                  <Languages className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setLanguage("en")}
                  className={
                    language === "en" ? "bg-accent font-medium" : ""
                  }
                >
                  English
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLanguage("pt-br")}
                  className={
                    language === "pt-br" ? "bg-accent font-medium" : ""
                  }
                >
                  Português (BR)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notificações */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground transition-colors hover:text-foreground"
              onClick={handleNotificationsClick}
            >
              <Bell className="h-5 w-5" />
              {hasNotifications && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary shadow-sm" />
              )}
            </Button>

            {/* Menu usuário */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full ring-1 ring-transparent transition-all duration-150 hover:ring-primary/40"
                >
                  <Avatar className="h-8 w-8">
                    {avatarUrl && <AvatarImage src={avatarUrl} />}
                    <AvatarFallback>
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  {t("nav.account")}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={goToProfile}>
                  {t("nav.profile")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={goToSettings}>
                  {t("nav.settings")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Conteúdo da página */}
        <main className="flex-1 overflow-auto bg-gradient-to-b from-background to-muted/40 dark:from-slate-950 dark:to-slate-900 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
