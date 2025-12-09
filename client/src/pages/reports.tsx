import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Legend
} from "recharts";
import { Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_MONTHLY_DATA = [
  { name: 'Jan', tickets: 65, resolved: 40 },
  { name: 'Feb', tickets: 59, resolved: 45 },
  { name: 'Mar', tickets: 80, resolved: 70 },
  { name: 'Apr', tickets: 81, resolved: 60 },
  { name: 'May', tickets: 56, resolved: 50 },
  { name: 'Jun', tickets: 55, resolved: 48 },
  { name: 'Jul', tickets: 40, resolved: 35 },
];

const MOCK_STATUS_DATA = [
  { name: 'Open', value: 12, color: '#3b82f6' }, // blue-500
  { name: 'In Progress', value: 19, color: '#f59e0b' }, // amber-500
  { name: 'Resolved', value: 45, color: '#22c55e' }, // green-500
  { name: 'Closed', value: 24, color: '#64748b' }, // slate-500
];

const MOCK_AGENT_PERFORMANCE = [
  { name: 'Alice', assigned: 45, resolved: 42 },
  { name: 'Bob', assigned: 38, resolved: 30 },
  { name: 'Charlie', assigned: 52, resolved: 48 },
  { name: 'David', assigned: 28, resolved: 25 },
];

const MOCK_TOP_CUSTOMERS = [
  { name: 'TechCorp Inc.', tickets: 15 },
  { name: 'Global Solutions', tickets: 12 },
  { name: 'StartupHub', tickets: 9 },
  { name: 'Creative Studio', tickets: 8 },
  { name: 'Local Business', tickets: 5 },
];

export default function ReportsPage() {
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">{t('reports.title')}</h1>
            <p className="text-muted-foreground">{t('reports.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="this_month">
              <SelectTrigger className="w-[180px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">436</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">88.5%</div>
              <p className="text-xs text-muted-foreground">+2.4% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Reply Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1h 12m</div>
              <p className="text-xs text-muted-foreground">-15m from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8/5.0</div>
              <p className="text-xs text-muted-foreground">+0.2 from last month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>{t('reports.tickets_over_time')}</CardTitle>
              <CardDescription>Volume of new vs resolved tickets over the last 7 months.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_MONTHLY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="tickets" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} name="New Tickets" />
                  <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} name="Resolved" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>{t('reports.tickets_by_status')}</CardTitle>
              <CardDescription>Current distribution of ticket statuses.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_STATUS_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {MOCK_STATUS_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>{t('reports.tickets_by_assignee')}</CardTitle>
              <CardDescription>Performance metrics per support agent.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_AGENT_PERFORMANCE} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={60} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Legend />
                  <Bar dataKey="assigned" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Assigned" barSize={20} />
                  <Bar dataKey="resolved" fill="#22c55e" radius={[0, 4, 4, 0]} name="Resolved" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>{t('reports.top_customers')}</CardTitle>
              <CardDescription>Customers with the highest ticket volume.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_TOP_CUSTOMERS}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="tickets" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Tickets Created" barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
