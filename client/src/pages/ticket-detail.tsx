import Layout from "@/components/layout";
import { useRoute, Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow, format } from "date-fns";
import {
  ArrowLeft,
  Reply,
  Lock,
  Send,
  Paperclip,
  Clock,
} from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const STATUS_COLORS = {
  open: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  in_progress:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  resolved:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  closed:
    "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-400 border-slate-200 dark:border-slate-700",
};

export default function TicketDetailPage() {
  const { t } = useLanguage();
  const [, params] = useRoute("/ticket/:id");
  const ticketId = params?.id;

  // Carrega ticket real do Supabase
  const {
    data: ticket,
    isLoading: isLoadingTicket,
    error: ticketError,
  } = useQuery({
    queryKey: ["ticket", ticketId],
    enabled: !!ticketId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select(
          `
          id,
          ticket_number,
          subject,
          description,
          status,
          priority,
          tags,
          created_at,
          requester:profiles!tickets_requester_id_fkey(
            id,
            full_name,
            email,
            avatar_url
          ),
          assignee:profiles!tickets_assignee_id_fkey(
            id,
            full_name,
            email,
            avatar_url
          )
        `,
        )
        .eq("id", ticketId)
        .single();

      if (error) throw error;
      return data as any;
    },
  });

  // Carrega mensagens reais do Supabase
  const {
    data: messages,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useQuery({
    queryKey: ["ticket_messages", ticketId],
    enabled: !!ticketId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_messages")
        .select(
          `
          id,
          content,
          is_internal,
          created_at,
          sender:profiles!ticket_messages_sender_id_fkey(
            id,
            full_name,
            avatar_url
          )
        `,
        )
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });

  if (!ticketId) {
    return (
      <Layout>
        <div className="p-6 text-sm text-red-500">
          Ticket ID inválido na URL.
        </div>
      </Layout>
    );
  }

  if (isLoadingTicket) {
    return (
      <Layout>
        <div className="p-6 text-sm text-muted-foreground">Carregando ticket...</div>
      </Layout>
    );
  }

  if (ticketError || !ticket) {
    return (
      <Layout>
        <div className="p-6 text-sm text-red-500">
          Não foi possível carregar o ticket.
        </div>
      </Layout>
    );
  }

  const requester = ticket.requester;
  const assignee = ticket.assignee;
  const tags: string[] = ticket.tags ?? [];

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Link
                href="/dashboard"
                className="hover:text-primary flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                {t("ticket.back")}
              </Link>
              <span>/</span>
              <span>
                Ticket{" "}
                {ticket.ticket_number ??
                  String(ticket.id).slice(0, 8)}
              </span>
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {ticket.subject}
            </h1>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={`border font-normal capitalize ${
                  STATUS_COLORS[
                    ticket.status as keyof typeof STATUS_COLORS
                  ]
                }`}
              >
                {t(`status.${ticket.status}`)}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Created{" "}
                {formatDistanceToNow(new Date(ticket.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">{t("ticket.close")}</Button>
            <Button>{t("ticket.update")}</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 h-full min-h-0">
          {/* Main Content - Conversation */}
          <div className="flex flex-col gap-4 h-full min-h-0">
            <ScrollArea className="flex-1 rounded-lg border bg-card shadow-sm p-4">
              <div className="space-y-6">
                {/* Original Request */}
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10 border mt-1">
                    <AvatarImage src={requester?.avatar_url || ""} />
                    <AvatarFallback>
                      {requester?.full_name?.charAt(0) ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {requester?.full_name || "Requester"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          via Email
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(
                          new Date(ticket.created_at),
                          "MMM d, h:mm a",
                        )}
                      </span>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-4 text-sm leading-relaxed border border-transparent">
                      {ticket.description}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Today
                    </span>
                  </div>
                </div>

                {/* Messages */}
                {isLoadingMessages && (
                  <div className="text-xs text-muted-foreground">
                    Carregando mensagens...
                  </div>
                )}

                {!isLoadingMessages &&
                  !messagesError &&
                  messages?.map((message: any) => {
                    const sender = message.sender;
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-4 ${
                          message.is_internal
                            ? "bg-yellow-50/50 dark:bg-yellow-900/10 -mx-4 px-4 py-4 border-y border-yellow-100 dark:border-yellow-900/30"
                            : ""
                        }`}
                      >
                        <Avatar className="h-10 w-10 border mt-1">
                          <AvatarImage
                            src={sender?.avatar_url || ""}
                          />
                          <AvatarFallback>
                            {sender?.full_name?.charAt(0) ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">
                                {sender?.full_name || "Agent"}
                              </span>
                              {message.is_internal && (
                                <Badge
                                  variant="outline"
                                  className="bg-yellow-100 text-yellow-800 border-yellow-200 text-[10px] px-1.5 h-5 flex gap-1"
                                >
                                  <Lock className="h-2.5 w-2.5" />{" "}
                                  {t("ticket.internal")}
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(
                                new Date(message.created_at),
                                "MMM d, h:mm a",
                              )}
                            </span>
                          </div>
                          <div className="text-sm leading-relaxed">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </ScrollArea>

            {/* Reply Area (ainda sem persistir no Supabase) */}
            <Card className="shadow-sm border-t-4 border-t-primary/20">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-4 border-b pb-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-muted text-foreground hover:bg-muted/80 h-8"
                    >
                      <Reply className="mr-2 h-4 w-4" />{" "}
                      {t("ticket.reply")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-muted-foreground hover:text-foreground"
                    >
                      <Lock className="mr-2 h-4 w-4" />{" "}
                      {t("ticket.internal")}
                    </Button>
                  </div>
                </div>
                <Textarea
                  placeholder="Type your reply here..."
                  className="min-h-[120px] resize-none border-0 focus-visible:ring-0 px-0"
                />
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline">Save as Draft</Button>
                    <Button>
                      <Send className="mr-2 h-4 w-4" />{" "}
                      {t("ticket.send")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3 border-b bg-muted/20">
                <CardTitle className="text-sm font-medium">
                  {t("ticket.details")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    {t("table.assignee")}
                  </label>
                  <div className="flex items-center gap-2 p-2 rounded-md border bg-card hover:bg-muted/50 cursor-pointer transition-colors">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={assignee?.avatar_url || ""}
                      />
                      <AvatarFallback>
                        {assignee?.full_name?.charAt(0) ?? "UN"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm flex-1">
                      {assignee?.full_name || "Unassigned"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    {t("table.status")}
                  </label>
                  <Select defaultValue={ticket.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">
                        {t("status.open")}
                      </SelectItem>
                      <SelectItem value="in_progress">
                        {t("status.in_progress")}
                      </SelectItem>
                      <SelectItem value="resolved">
                        {t("status.resolved")}
                      </SelectItem>
                      <SelectItem value="closed">
                        {t("status.closed")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    {t("table.priority")}
                  </label>
                  <Select defaultValue={ticket.priority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        {t("priority.low")}
                      </SelectItem>
                      <SelectItem value="medium">
                        {t("priority.medium")}
                      </SelectItem>
                      <SelectItem value="high">
                        {t("priority.high")}
                      </SelectItem>
                      <SelectItem value="urgent">
                        {t("priority.urgent")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="font-normal text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-5 px-2 text-[10px]"
                    >
                      + Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b bg-muted/20">
                <CardTitle className="text-sm font-medium">
                  {t("ticket.requester_info")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage
                      src={requester?.avatar_url || ""}
                    />
                    <AvatarFallback>
                      {requester?.full_name?.charAt(0) ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden">
                    <p className="font-medium text-sm truncate">
                      {requester?.full_name || "Requester"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {requester?.email || ""}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Esses números ainda estão mockados até termos métrica real */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Total Tickets
                    </span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Active
                    </span>
                    <span className="font-medium">2</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full text-xs h-8">
                  View Customer Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
