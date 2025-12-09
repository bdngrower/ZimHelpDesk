import Layout from "@/components/layout";
import { MOCK_TICKETS } from "@/lib/mock-data";
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
import { 
  DropdownMenu, 
  DropdownMenuCheckboxItem, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Filter, Plus, Search } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/context/language-context";

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

export default function DashboardPage() {
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">{t('dashboard.title')}</h1>
            <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('dashboard.new_ticket')}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.open_tickets')}</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 since last hour</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.pending')}</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">-1 since yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.avg_time')}</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1h 24m</div>
              <p className="text-xs text-muted-foreground">-12% from last week</p>
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
                    placeholder={t('search.placeholder')}
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
                    <DropdownMenuCheckboxItem checked>{t('status.open')}</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked>{t('status.in_progress')}</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>{t('status.resolved')}</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>{t('status.closed')}</DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[100px]">{t('table.id')}</TableHead>
                  <TableHead className="min-w-[300px]">{t('table.subject')}</TableHead>
                  <TableHead>{t('table.status')}</TableHead>
                  <TableHead>{t('table.priority')}</TableHead>
                  <TableHead>{t('table.requester')}</TableHead>
                  <TableHead>{t('table.assignee')}</TableHead>
                  <TableHead className="text-right">{t('table.created')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_TICKETS.map((ticket) => (
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
                        <div className={`h-2 w-2 rounded-full ${PRIORITY_COLORS[ticket.priority].replace('text-', 'bg-')}`} />
                        <span className="capitalize text-sm">{t(`priority.${ticket.priority}`)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={ticket.customer.avatar} />
                          <AvatarFallback>{ticket.customer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{ticket.customer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {ticket.assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={ticket.assignee.avatar} />
                            <AvatarFallback>{ticket.assignee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{ticket.assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
