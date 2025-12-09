import { useState } from "react";
import Layout from "@/components/layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Filter, Plus, Search, Loader2, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/context/language-context";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/auth-context";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const STATUS_COLORS = {
  open: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  in_progress:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  resolved:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  closed:
    "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-400 border-slate-200 dark:border-slate-700",
};

const PRIORITY_COLORS = {
  low: "text-slate-500",
  medium: "text-blue-500",
  high: "text-orange-500",
  urgent: "text-red-500",
};

type TicketPriority = "low" | "medium" | "high" | "urgent";

export default function DashboardPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [description, setDescription] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [requesterId, setRequesterId] = useState<string>("");

  // === LOAD TICKETS REAL DATA ===
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["dashboard_tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          id,
          ticket_number,
          subject,
          description,
          status,
          priority,
          created_at,
          requester:profiles!tickets_requester_id_fkey(id, full_name, avatar_url),
          assignee:profiles!tickets_assignee_id_fkey(id, full_name, avatar_url)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data ?? [];
    },
  });

  // === LOAD CUSTOMERS (profiles com role = 'customer') ===
  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["customers_for_new_ticket"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "customer")
        .order("full_name", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });

  // === CREATE TICKET MUTATION ===
  const createTicketMutation = useMutation({
    mutationFn: async (payload: {
      subject: string;
      description: string;
      priority: TicketPriority;
      requester_id?: string;
    }) => {
      if (!user && !payload.requester_id) {
        throw new Error("Usuário não autenticado.");
      }

      const finalRequesterId = payload.requester_id || user?.id;

      const { data, error } = await supabase
        .from("tickets")
        .insert({
          subject: payload.subject,
          description: payload.description,
          priority: payload.priority,
          status: "open",
          requester_id: finalRequesterId,
        })
        .select("id")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard_tickets"] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });

      setSubject("");
      setDescription("");
      setPriority("medium");
      setRequesterId("");
      setSubmitError(null);
      setIsDialogOpen(false);
    },
    onError: (err: any) => {
      setSubmitError(err.message ?? "Erro ao criar chamado.");
    },
  });

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!subject.trim()) {
      setSubmitError("Informe um assunto para o chamado.");
      return;
    }

    createTicketMutation.mutate({
      subject: subject.trim(),
      description: description.trim(),
      priority,
      requester_id: requesterId || undefined,
    });
  }

  // === COUNTS ===
  const openCount =
    tickets?.filter((t: any) => t.status === "open").length ?? 0;
  const pendingCount =
    tickets?.filter((t: any) => t.status === "in_progress").length ?? 0;
  const resolvedCount =
    tickets?.filter((t: any) => t.status === "resolved").length ?? 0;

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
              {t("dashboard.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("dashboard.subtitle")}
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("dashboard.new_ticket")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>{t("dashboard.new_ticket")}</DialogTitle>
                <DialogDescription>
                  Preencha os dados para abrir um novo chamado. Ele será
                  criado no Supabase com status &quot;open&quot;.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={handleCreateTicket}
                className="grid gap-4 py-4"
              >
                <div className="grid gap-2">
                  <Label htmlFor="subject">Assunto</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ex.: Erro ao acessar o painel"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="requester">Solicitante / Cliente</Label>
                  {isLoadingCustomers ? (
                    <div className="text-xs text-muted-foreground">
                      Carregando clientes...
                    </div>
                  ) : customers && customers.length > 0 ? (
                    <Select
                      value={requesterId}
                      onValueChange={(value) => setRequesterId(value)}
                    >
                      <SelectTrigger id="requester">
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((c: any) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.full_name || c.email}{" "}
                            {c.email ? `(${c.email})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      Nenhum cliente encontrado. O chamado será aberto em
                      seu usuário.
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select
                      value={priority}
                      onValueChange={(value: any) =>
                        setPriority(value as TicketPriority)
                      }
                    >
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva o problema com o máximo de detalhes possível..."
                    rows={4}
                  />
                </div>

                {submitError && (
                  <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{submitError}</span>
                  </div>
                )}

                <DialogFooter className="mt-2">
                  <Button
                    type="submit"
                    disabled={createTicketMutation.isLoading}
                  >
                    {createTicketMutation.isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      "Criar Chamado"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* OPEN TICKETS */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.open_tickets")}
              </CardTitle>
              <div className="h-4 w-4 text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openCount}</div>
              <p className="text-xs text-muted-foreground">Dados reais</p>
            </CardContent>
          </Card>

          {/* PENDING */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.pending")}
              </CardTitle>
              <div className="h-4 w-4 text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">Dados reais</p>
            </CardContent>
          </Card>

          {/* RESOLVED */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("status.resolved")}
              </CardTitle>
              <div className="h-4 w-4 text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resolvedCount}</div>
              <p className="text-xs text-muted-foreground">Dados reais</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="border-b bg-muted/40 px-6 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("search.placeholder")}
                    className="w-[250px] bg-background pl-9"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>
                      {t("status.open")}
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked>
                      {t("status.in_progress")}
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      {t("status.resolved")}
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      {t("status.closed")}
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[100px]">
                    {t("table.id")}
                  </TableHead>
                  <TableHead className="min-w-[300px]">
                    {t("table.subject")}
                  </TableHead>
                  <TableHead>{t("table.status")}</TableHead>
                  <TableHead>{t("table.priority")}</TableHead>
                  <TableHead>{t("table.requester")}</TableHead>
                  <TableHead>{t("table.assignee")}</TableHead>
                  <TableHead className="text-right">
                    {t("table.created")}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  tickets?.map((ticket: any) => {
                    const displayId =
                      ticket.ticket_number ??
                      String(ticket.id).slice(0, 8);

                    return (
                      <TableRow
                        key={ticket.id}
                        className="group cursor-pointer hover:bg-muted/30"
                      >
                        <TableCell className="font-medium">
                          <Link
                            href={`/ticket/${ticket.id}`}
                            className="block w-full text-primary hover:underline"
                          >
                            {displayId}
                          </Link>
                        </TableCell>

                        <TableCell>
                          <Link
                            href={`/ticket/${ticket.id}`}
                            className="block w-full"
                          >
                            <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                              {ticket.subject}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {ticket.description}
                            </div>
                          </Link>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`border font-normal capitalize shadow-sm ${
                              STATUS_COLORS[
                                ticket.status as keyof typeof STATUS_COLORS
                              ]
                            }`}
                          >
                            {t(`status.${ticket.status}`)}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                PRIORITY_COLORS[
                                  ticket.priority as keyof typeof PRIORITY_COLORS
                                ].replace("text-", "bg-")
                              }`}
                            />
                            <span className="capitalize text-sm">
                              {t(`priority.${ticket.priority}`)}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={ticket.requester?.avatar_url || ""}
                              />
                              <AvatarFallback>
                                {ticket.requester?.full_name?.charAt(0) ??
                                  "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {ticket.requester?.full_name || "Unknown"}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          {ticket.assignee ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={ticket.assignee?.avatar_url || ""}
                                />
                                <AvatarFallback>
                                  {ticket.assignee?.full_name?.charAt(0) ??
                                    "?"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">
                                {ticket.assignee?.full_name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              Unassigned
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-right text-muted-foreground text-sm">
                          {formatDistanceToNow(
                            new Date(ticket.created_at),
                            {
                              addSuffix: true,
                            },
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}

                {!isLoading && tickets?.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No tickets found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
