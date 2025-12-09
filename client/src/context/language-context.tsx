import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'pt-br';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'app.title': 'HelpDesk Pro',
    'nav.dashboard': 'Dashboard',
    'nav.tickets': 'All Tickets',
    'nav.customers': 'Customers',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',
    'nav.logout': 'Log out',
    'nav.profile': 'Profile',
    'nav.account': 'My Account',
    'search.placeholder': 'Search tickets...',
    'status.open': 'Open',
    'status.in_progress': 'In Progress',
    'status.resolved': 'Resolved',
    'status.closed': 'Closed',
    'priority.low': 'Low',
    'priority.medium': 'Medium',
    'priority.high': 'High',
    'priority.urgent': 'Urgent',
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Manage and track your support tickets.',
    'dashboard.new_ticket': 'New Ticket',
    'dashboard.open_tickets': 'Open Tickets',
    'dashboard.pending': 'Pending Response',
    'dashboard.avg_time': 'Avg. Response Time',
    'table.id': 'ID',
    'table.subject': 'Subject',
    'table.status': 'Status',
    'table.priority': 'Priority',
    'table.requester': 'Requester',
    'table.assignee': 'Assignee',
    'table.created': 'Created',
    'login.welcome': 'Welcome back',
    'login.subtitle': 'Enter your credentials to access the agent portal',
    'login.signin': 'Sign in',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.forgot': 'Forgot password?',
    'login.button': 'Sign in',
    'login.signing_in': 'Signing in...',
    'settings.title': 'Settings',
    'settings.subtitle': 'Manage system configuration, email integrations, and automation rules.',
    'settings.general': 'General',
    'settings.email': 'Email',
    'settings.spam': 'Spam Filter',
    'settings.team': 'Team',
    'settings.save': 'Save Changes',
    'ticket.back': 'Back to Dashboard',
    'ticket.close': 'Close Ticket',
    'ticket.update': 'Update Status',
    'ticket.reply': 'Reply',
    'ticket.internal': 'Internal Note',
    'ticket.send': 'Send Reply',
    'ticket.details': 'Ticket Details',
    'ticket.requester_info': 'Requester Info',
    'customers.title': 'Customers',
    'customers.subtitle': 'View and manage your customer base.',
    'all_tickets.title': 'All Tickets',
    'all_tickets.subtitle': 'View and filter all support tickets.',
    'reports.title': 'Analytics & Reports',
    'reports.subtitle': 'Visualize ticket trends, agent performance, and customer data.',
    'reports.tickets_over_time': 'Tickets Over Time',
    'reports.tickets_by_status': 'Ticket Status Distribution',
    'reports.tickets_by_assignee': 'Agent Performance',
    'reports.top_customers': 'Top Customers by Volume'
  },
  'pt-br': {
    'app.title': 'HelpDesk Pro',
    'nav.dashboard': 'Painel',
    'nav.tickets': 'Todos os Chamados',
    'nav.customers': 'Clientes',
    'nav.reports': 'Relatórios',
    'nav.settings': 'Configurações',
    'nav.logout': 'Sair',
    'nav.profile': 'Perfil',
    'nav.account': 'Minha Conta',
    'search.placeholder': 'Buscar chamados...',
    'status.open': 'Aberto',
    'status.in_progress': 'Em Andamento',
    'status.resolved': 'Resolvido',
    'status.closed': 'Fechado',
    'priority.low': 'Baixa',
    'priority.medium': 'Média',
    'priority.high': 'Alta',
    'priority.urgent': 'Urgente',
    'dashboard.title': 'Painel de Controle',
    'dashboard.subtitle': 'Gerencie e acompanhe seus chamados de suporte.',
    'dashboard.new_ticket': 'Novo Chamado',
    'dashboard.open_tickets': 'Chamados Abertos',
    'dashboard.pending': 'Aguardando Resposta',
    'dashboard.avg_time': 'Tempo Médio de Resposta',
    'table.id': 'ID',
    'table.subject': 'Assunto',
    'table.status': 'Status',
    'table.priority': 'Prioridade',
    'table.requester': 'Solicitante',
    'table.assignee': 'Responsável',
    'table.created': 'Criado em',
    'login.welcome': 'Bem-vindo de volta',
    'login.subtitle': 'Entre com suas credenciais para acessar o portal',
    'login.signin': 'Entrar',
    'login.email': 'E-mail',
    'login.password': 'Senha',
    'login.forgot': 'Esqueceu a senha?',
    'login.button': 'Entrar',
    'login.signing_in': 'Entrando...',
    'settings.title': 'Configurações',
    'settings.subtitle': 'Gerencie configurações do sistema, integrações de e-mail e regras de automação.',
    'settings.general': 'Geral',
    'settings.email': 'E-mail',
    'settings.spam': 'Filtro de Spam',
    'settings.team': 'Equipe',
    'settings.save': 'Salvar Alterações',
    'ticket.back': 'Voltar ao Painel',
    'ticket.close': 'Fechar Chamado',
    'ticket.update': 'Atualizar Status',
    'ticket.reply': 'Responder',
    'ticket.internal': 'Nota Interna',
    'ticket.send': 'Enviar Resposta',
    'ticket.details': 'Detalhes do Chamado',
    'ticket.requester_info': 'Informações do Solicitante',
    'customers.title': 'Clientes',
    'customers.subtitle': 'Visualize e gerencie sua base de clientes.',
    'all_tickets.title': 'Todos os Chamados',
    'all_tickets.subtitle': 'Visualize e filtre todos os chamados de suporte.',
    'reports.title': 'Relatórios e Análises',
    'reports.subtitle': 'Visualize tendências, desempenho da equipe e dados de clientes.',
    'reports.tickets_over_time': 'Chamados por Período',
    'reports.tickets_by_status': 'Distribuição por Status',
    'reports.tickets_by_assignee': 'Desempenho por Agente',
    'reports.top_customers': 'Clientes com Mais Chamados'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('pt-br'); // Default to PT-BR as requested

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
