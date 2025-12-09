import Layout from "@/components/layout";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Search, SlidersHorizontal, Download, Plus } from "lucide-react";
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

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const STATUS_COLORS = {
  open: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  resolved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  closed: "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-400 border-slate-200 dark:border-slate-700"
};

const PRIORITY_COLORS = {
  low: "text-slate-500",
  medium: "text-blue-500",
  high: "text-orange-500",
  urgent: "text-red-500"
};

export default function AllTicketsPage() {
  const { t } = useLanguage();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          id,
          subject,
          description,
          status,
          priority,
          created_at,
          requester:requester_id (
            id,
            full_name,
            avatar_url
          ),
          assignee:assignee_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
              {t("all_tickets.title")}
            </h1>
            <p className="text-muted-foreground">{t("all_tickets.subtitle")}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("dashboard.new_ticket")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{t("dashboard.new_ticket")}</DialogTitle>
                  <DialogDescription>
                    Create a new support ticket. An email notification will be sent to the customer.
                  </DialogDescription>
                </DialogHeader>

                {/* FORM AINDA MOCK — vamos trocar isso depois */}
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Subject</Label>
                    <Input placeholder="e.g., Cannot access login page" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Requester Email</Label>
                    <Input placeholder="customer@example.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Priority</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Assignee</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select agent" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="me">Assign to me</SelectItem>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Textarea placeholder="Describe the issue..." />
                  </div>
                </div>

                <DialogFooter>
                  <Button>Create Ticket</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="border-b bg-muted/40 px-6 py-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("search.placeholder")}
                  className="w-full bg-background pl-9"
                />
              </div>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[100px]">{t("table.id")}</TableHead>
                  <TableHead className="min-w-[300px]">{t("table.subject")}</TableHead>
                  <TableHead>{t("table.status")}</TableHead>
                  <TableHead>{t("table.priority")}</TableHead>
                  <TableHead>{t("table.requester")}</TableHead>
                  <TableHead>{t("table.assignee")}</TableHead>
                  <TableHead className="text-right">{t("table.created")}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      Loading tickets...
                    </TableCell>
                  </TableRow>
                )}

                {tickets?.map((ticket) => (
                  <TableRow key={ticket.id} className="group cursor-pointer hover:bg-muted/30">
                    <TableCell className="font-medium">
                      <Link href={`/ticket/${ticket.id}`} className="block w-full text-primary hover:underline">
                        {ticket.id}
                      </Link>
                    </TableCell>

                    <TableCell>
                      <Link href={`/ticket/${ticket.id}`} className="block w-full">
                        <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {ticket.subject}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {ticket.description}
                        </div>
                      </Link>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className={`border font-normal capitalize shadow-sm ${STATUS_COLORS[ticket.status]}`}>
                        {t(`status.${ticket.status}`)}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${PRIORITY_COLORS[ticket.priority].replace("text-", "bg-")}`} />
                        <span className="capitalize text-sm">{t(`priority.${ticket.priority}`)}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={ticket.requester?.avatar_url || ""} />
                          <AvatarFallback>{ticket.requester?.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{ticket.requester?.full_name || "Unknown"}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {ticket.assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={ticket.assignee?.avatar_url || ""} />
                            <AvatarFallback>{ticket.assignee?.full_name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{ticket.assignee?.full_name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Unassigned</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}

                {tickets?.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
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
