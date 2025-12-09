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
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import {
  Search,
  SlidersHorizontal,
  Download,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/context/language-context";
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

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/auth-context";

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

export default function AllTicketsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [description, setDescription] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [requesterId, setRequesterId] = useState<string>("");

  const { data: tickets, isLoading, error } = useQuery({
    queryKey: ["tickets"],
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
          requester:profiles!tickets_requester_id_fkey (
            id,
            full_name,
            avatar_url
          ),
          assignee:profiles!tickets_assignee_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });

  // Carregar clientes (profiles role = customer)
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
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard_tickets"] });

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

  function handleCreateTicket(e: React.FormEvent) {
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

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
              {t("all_tickets.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("all_tickets.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2 rounded-full border-dashed transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/5 hover:shadow-sm"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="gap-2 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t("dashboard.new_ticket")}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">
                    {t("dashboard.new_ticket")}
                  </DialogTitle>
                  <DialogDescription>
                    Crie um novo chamado. Ele será salvo no Supabase com
                    status <span className="font-semibold">&quot;open&quot;</span>.
                  </DialogDescription>
                </DialogHeader>

                <form
                  onSubmit={handleCreateTicket}
                  className="grid gap-4 py-4"
                >
                  <div className="grid gap-2">
                    <Label>Assunto</Label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Ex.: Não consigo acessar o sistema"
                      required
                      className="rounded-lg"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Solicitante / Cliente</Label>
                    {isLoadingCustomers ? (
                      <div className="text-xs text-muted-foreground">
                        Carregando clientes...
                      </div>
                    ) : customers && customers.length > 0 ? (
                      <Select
                        value={requesterId}
                        onValueChange={(value) => setRequesterId(value)}
                      >
                        <SelectTrigger className="rounded-lg">
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
                        Nenhum cliente encontrado. O chamado será aberto
                        em seu usuário.
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Prioridade</Label>
                      <Select
                        value={priority}
                        onValueChange={(value: any) =>
                          setPriority(value as TicketPriority)
                        }
                      >
                        <SelectTrigger className="rounded-lg">
                          <SelectValue placeholder="Selecione" />
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
                    <Label>Descrição</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descreva o problema..."
                      rows={4}
                      className="rounded-lg"
                    />
                  </div>

                  {submitError && (
                    <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={createTicketMutation.isLoading}
                      className="gap-2 rounded-full px-6 transition-transform duration-150 hover:scale-[1.02]"
                    >
                      {createTicketMutation.isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Criando...</span>
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
        </div>

        {/* Lista de tickets */}
        <Card className="border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
          <CardHeader className="border-b bg-muted/40 px-6 py-4">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("search.placeholder")}
                  className="w-full rounded-full bg-background/80 pl-9 text-sm shadow-none transition-colors focus-visible:bg-background"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-dashed transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/5"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/60">
                  <TableHead className="w-[100px] text-xs uppercase tracking-wide text-muted-foreground">
                    {t("table.id")}
                  </TableHead>
                  <TableHead className="min-w-[300px] text-xs uppercase tracking-wide text-muted-foreground">
                    {t("table.subject")}
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t("table.status")}
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t("table.priority")}
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t("table.requester")}
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t("table.assignee")}
                  </TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wide text-muted-foreground">
                    {t("table.created")}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      Loading tickets...
                    </TableCell>
                  </TableRow>
                )}

                {error && !isLoading && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-sm text-red-500"
                    >
                      Failed to load tickets.
                    </TableCell>
                  </TableRow>
                )}

                {tickets?.map((ticket: any) => {
                  const displayId =
                    ticket.ticket_number ??
                    String(ticket.id).slice(0, 8);

                  return (
                    <TableRow
                      key={ticket.id}
                      className="group cursor-pointer border-b last:border-b-0 transition-colors hover:bg-muted/30"
                    >
                      <TableCell className="font-medium">
                        <Link
                          href={`/ticket/${ticket.id}`}
                          className="block w-full text-sm font-semibold text-primary transition-colors hover:text-primary/80 hover:underline"
                        >
                          {displayId}
                        </Link>
                      </TableCell>

                      <TableCell>
                        <Link
                          href={`/ticket/${ticket.id}`}
                          className="block w-full"
                        >
                          <div className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                            {ticket.subject}
                          </div>
                          <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                            {ticket.description}
                          </div>
                        </Link>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`border font-normal capitalize shadow-sm transition-colors ${
                            STATUS_COLORS[
                              ticket.status as keyof typeof STATUS_COLORS
                            ]
                          }`}
                        >
                          {t(`status.${ticket.status}`)}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              PRIORITY_COLORS[
                                ticket.priority as keyof typeof PRIORITY_COLORS
                              ].replace("text-", "bg-")
                            }`}
                          />
                          <span className="capitalize">
                            {t(`priority.${ticket.priority}`)}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6 border">
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
                            <Avatar className="h-6 w-6 border">
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
                          <span className="text-xs italic text-muted-foreground">
                            Unassigned
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="text-right text-sm text-muted-foreground">
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

                {tickets &&
                  tickets.length === 0 &&
                  !isLoading &&
                  !error && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-10 text-center text-sm text-muted-foreground"
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
