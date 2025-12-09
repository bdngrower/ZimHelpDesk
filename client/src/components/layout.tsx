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
  BarChart3
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import logo from "@assets/generated_images/modern_abstract_logo_for_a_help_desk_software.png";
import { useLanguage } from "@/context/language-context";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  const NavItem = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => {
    const isActive = location === href || location.startsWith(href + '/');
    return (
      <Link href={href}>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className={`w-full justify-start gap-3 ${isActive ? 'font-semibold text-primary' : 'text-muted-foreground'}`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Button>
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-display font-bold text-xl tracking-tight">
          <img src={logo} alt="Logo" className="h-8 w-8 rounded-md" />
          <span>HelpDesk<span className="text-primary">Pro</span></span>
        </Link>
      </div>
      <div className="flex-1 px-4 py-2">
        <nav className="flex flex-col gap-1">
          <NavItem href="/dashboard" icon={LayoutDashboard} label={t('nav.dashboard')} />
          <NavItem href="/tickets" icon={Ticket} label={t('nav.tickets')} />
          <NavItem href="/reports" icon={BarChart3} label={t('nav.reports')} />
          <NavItem href="/customers" icon={Users} label={t('nav.customers')} />
          <NavItem href="/settings" icon={Settings} label={t('nav.settings')} />
        </nav>
      </div>
      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
          <Avatar className="h-9 w-9 border">
            <AvatarImage src="https://i.pravatar.cc/150?u=bob" />
            <AvatarFallback>BS</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium">Bob Smith</span>
            <span className="truncate text-xs text-muted-foreground">bob@company.com</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 md:grid md:grid-cols-[240px_1fr]">
      {/* Desktop Sidebar */}
      <aside className="hidden border-r bg-background md:block">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex flex-col h-screen overflow-hidden">
        <header className="sticky top-0 z-30 flex h-16 flex-none items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm">
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[240px]">
              <SidebarContent />
            </SheetContent>
          </Sheet>

          <div className="flex flex-1 items-center gap-4">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('search.placeholder')}
                className="w-full bg-muted/50 pl-9 shadow-none focus-visible:bg-background"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon" className="text-muted-foreground">
                   <Languages className="h-5 w-5" />
                 </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('en')} className={language === 'en' ? 'bg-accent' : ''}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('pt-br')} className={language === 'pt-br' ? 'bg-accent' : ''}>
                  Português (BR)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://i.pravatar.cc/150?u=bob" />
                    <AvatarFallback>BS</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('nav.account')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>{t('nav.profile')}</DropdownMenuItem>
                <DropdownMenuItem>{t('nav.settings')}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
