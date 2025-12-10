import { useMemo, useState } from "react";
import Layout from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/context/language-context";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  startOfWeek,
  startOfMonth,
  startOfYear,
  subMonths,
} from "date-fns";
import { format } from "date-fns";

const STATUS_COLORS = {
  open: "#3b82f6", // blue-500
  in_progress: "#f59e0b", // amber-500
  resolved: "#22c55e", // green-500
  closed: "#64748b", // slate-500
};

type Period = "this_week" | "this_month" | "last_month" | "this_year";

export default function ReportsPage() {
  const { t } = useLanguage();
  const [period, setPeriod] = useState<Period>("this_month");

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["reports_tickets", period],
    queryFn: async () => {
      const now = new Date();
      let from: Date | null = null;
      let to: Date | null = null;

      switch (period) {
        case "this_week":
          from = startOfWeek(now, { weekStartsOn: 1 });
          break;
        case "this_month":
          from = startOfMonth(now);
          break;
        case "last_month":
          const lastMonth = subMonths(startOfMonth(now), 1);
          from = lastMonth;
          to = startOfMonth(now);
          break;
        case "this_year":
          from = startOfYear(now);
          break;
      }

      let query = supabase
        .from("tickets")
        .select(
          `
          id,
          status,
          priority,
          created_at,
          requester:profiles!tickets_requester_id_fkey(id, full_name),
          assignee:profiles!tickets_assignee_id_fkey(id, full_name)
        `,
        );

      if (from) {
        query = query.gte("created_at", from.toISOString());
      }
      if (to) {
        query = query.lt("created_at", to.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  // ---------- KPIs básicos ----------
  const totalTickets = tickets.length;
  const resolvedTickets = tickets.filter(
    (t: any) => t.status === "resolved",
  ).length;
  const resolutionRate =
    totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0;

  // ---------- Tickets ao longo dos meses (últimos 7 meses) ----------
  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: { name: string; key: string }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = subMonths(now, i);
      const key = format(d, "yyyy-MM");
      const name = format(d, "MMM");
      months.push({ name, key });
    }

    const map: Record<
      string,
      { name: string; tickets: number; resolved: number }
    > = {};
    months.forEach((m) => {
      map[m.key] = { name: m.name, tickets: 0, resolved: 0 };
    });

    tickets.forEach((t: any) => {
      const d = new Date(t.created_at);
      const key = format(d, "yyyy-MM");
      if (!map[key]) return;
      map[key].tickets += 1;
      if (t.status === "resolved") {
        map[key].resolved += 1;
      }
    });

    return months.map((m) => map[m.key]);
  }, [tickets]);

  // ---------- Tickets por status ----------
  const statusData = useMemo(() => {
    const counts: Record<
      string,
      { name: string; value: number; color: string }
    > = {
      open: {
        name: "Open",
        value: 0,
        color: STATUS_COLORS.open,
      },
      in_progress: {
        name: "In Progress",
        value: 0,
        color: STATUS_COLORS.in_progress,
      },
      resolved: {
        name: "Resolved",
        value: 0,
        color: STATUS_COLORS.resolved,
      },
      closed: {
        name: "Closed",
        value: 0,
        color: STATUS_COLORS.closed,
      },
    };

    tickets.forEach((t: any) => {
      if (counts[t.status]) {
        counts[t.status].value += 1;
      }
    });

    return Object.values(counts);
  }, [tickets]);

  // ---------- Performance por agente ----------
  const agentPerformance = useMemo(() => {
    const map: Record<
      string,
      { name: string; assigned: number; resolved: number }
    > = {};

    tickets.forEach((t: any) => {
      const name = t.assignee?.full_name || "Unassigned";
      if (!map[name]) {
        map[name] = { name, assigned: 0, resolved: 0 };
      }
      map[name].assigned += 1;
      if (t.status === "resolved") {
        map[name].resolved += 1;
      }
    });

    return Object.values(map).sort(
      (a, b) => b.assigned - a.assigned,
    );
  }, [tickets]);

  // ---------- Top clientes ----------
  const topCustomers = useMemo(() => {
    const map: Record<string, { name: string; tickets: number }> = {};

    tickets.forEach((t: any) => {
      const name = t.requester?.full_name || "Unknown";
      if (!map[name]) {
        map[name] = { name, tickets: 0 };
      }
      map[name].tickets += 1;
    });

    return Object.values(map)
      .sort((a, b) => b.tickets - a.tickets)
      .slice(0, 5);
  }, [tickets]);

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
              {t("reports.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("reports.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={period}
              onValueChange={(value: Period) => setPeriod(value)}
            >
              <SelectTrigger className="w-[190px] rounded-full">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">
                  Last Month
                </SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="gap-2 rounded-full border-dashed transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/5"
            >
              <Download className="h-4 w-4" />
              <span>Export PDF</span>
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "…" : totalTickets}
              </div>
              <p className="text-xs text-muted-foreground">
                Período selecionado
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Resolution Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading
                  ? "…"
                  : `${resolutionRate.toFixed(1)}%`}
              </div>
              <p className="text-xs text-muted-foreground">
                Resolved / Total
              </p>
            </CardContent>
          </Card>

          {/* Ainda placeholders por enquanto */}
          <Card className="border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Reply Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">—</div>
              <p className="text-xs text-muted-foreground">
                Ainda não calculado
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Customer Satisfaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">—</div>
              <p className="text-xs text-muted-foreground">
                Ainda não calculado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Linha + Pizza */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="col-span-1 border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader>
              <CardTitle>
                {t("reports.tickets_over_time")}
              </CardTitle>
              <CardDescription>
                Volume de novos vs resolvidos nos últimos 7 meses.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="tickets"
                    stroke={STATUS_COLORS.open}
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                    name="New Tickets"
                  />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    stroke={STATUS_COLORS.resolved}
                    strokeWidth={2}
                    name="Resolved"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-1 border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader>
              <CardTitle>
                {t("reports.tickets_by_status")}
              </CardTitle>
              <CardDescription>
                Distribuição atual dos status de tickets.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Agentes + Clientes */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="col-span-1 border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader>
              <CardTitle>
                {t("reports.tickets_by_assignee")}
              </CardTitle>
              <CardDescription>
                Número de tickets atribuídos e resolvidos por agente.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={agentPerformance}
                  layout="vertical"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis
                    type="number"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip cursor={{ fill: "transparent" }} />
                  <Legend />
                  <Bar
                    dataKey="assigned"
                    fill={STATUS_COLORS.open}
                    radius={[0, 4, 4, 0]}
                    name="Assigned"
                    barSize={20}
                  />
                  <Bar
                    dataKey="resolved"
                    fill={STATUS_COLORS.resolved}
                    radius={[0, 4, 4, 0]}
                    name="Resolved"
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-1 border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader>
              <CardTitle>
                {t("reports.top_customers")}
              </CardTitle>
              <CardDescription>
                Clientes com maior volume de tickets.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCustomers}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip cursor={{ fill: "transparent" }} />
                  <Bar
                    dataKey="tickets"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                    name="Tickets Created"
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
