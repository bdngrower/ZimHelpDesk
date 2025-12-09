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
import { AuthProvider } from "@/context/auth-context";
import ProtectedRoute from "@/components/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />

      <Route path="/dashboard">
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      </Route>

      <Route path="/tickets">
        <ProtectedRoute>
          <AllTicketsPage />
        </ProtectedRoute>
      </Route>

      <Route path="/reports">
        <ProtectedRoute>
          <ReportsPage />
        </ProtectedRoute>
      </Route>

      <Route path="/customers">
        <ProtectedRoute>
          <CustomersPage />
        </ProtectedRoute>
      </Route>

      <Route path="/ticket/:id">
        <ProtectedRoute>
          <TicketDetailPage />
        </ProtectedRoute>
      </Route>

      <Route path="/settings">
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
