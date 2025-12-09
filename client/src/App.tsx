import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import NotFound from "@/pages/not-found";

import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import TicketDetailPage from "@/pages/ticket-detail";
import SettingsPage from "@/pages/settings";
import AllTicketsPage from "@/pages/all-tickets";
import CustomersPage from "@/pages/customers";
import ReportsPage from "@/pages/reports";
import { LanguageProvider } from "@/context/language-context";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/tickets" component={AllTicketsPage} />
      <Route path="/reports" component={ReportsPage} />
      <Route path="/customers" component={CustomersPage} />
      <Route path="/ticket/:id" component={TicketDetailPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
