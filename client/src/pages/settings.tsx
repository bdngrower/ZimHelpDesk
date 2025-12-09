import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  Mail,
  ShieldAlert,
  Server,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

type TeamMember = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  avatar_url: string | null;
};

export default function SettingsPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  // Team members reais do Supabase (agents + admins)
  const {
    data: teamMembers = [],
    isLoading: isLoadingTeam,
    error: teamError,
  } = useQuery<TeamMember[]>({
    queryKey: ["team_members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, avatar_url")
        .in("role", ["agent", "admin"]);

      if (error) throw error;
      return (data ?? []) as TeamMember[];
    },
  });

  const handleTestConnection = () => {
    setIsTestingConnection(true);
    setConnectionStatus("idle");

    // Simula teste de conexão (por enquanto não integra com backend)
    setTimeout(() => {
      setIsTestingConnection(false);
      setConnectionStatus("success");
      toast({
        title: "Connection Successful",
        description: "Successfully connected to IMAP and SMTP servers.",
      });
    }, 2000);
  };

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your configuration has been updated successfully.",
    });
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
            {t("settings.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("settings.subtitle")}
          </p>
        </div>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="general">
              {t("settings.general")}
            </TabsTrigger>
            <TabsTrigger value="email">
              {t("settings.email")}
            </TabsTrigger>
            <TabsTrigger value="spam">
              {t("settings.spam")}
            </TabsTrigger>
            <TabsTrigger value="team">
              {t("settings.team")}
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("settings.general")}</CardTitle>
                  <CardDescription>
                    Basic settings for your help desk instance.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="desk-name">Help Desk Name</Label>
                    <Input
                      id="desk-name"
                      defaultValue="HelpDesk Pro Support"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="support-email">
                      Public Support Email
                    </Label>
                    <Input
                      id="support-email"
                      defaultValue="support@company.com"
                    />
                    <p className="text-xs text-muted-foreground">
                      This is the email address displayed to customers.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/20 px-6 py-4">
                  <Button onClick={handleSave}>
                    {t("settings.save")}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="email" className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      Email Channel Status
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Monitoring{" "}
                      <span className="font-medium text-foreground">
                        support@company.com
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
                    </span>
                    Active
                  </span>
                  <Switch checked />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Incoming Mail (IMAP) */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-primary" />
                      <CardTitle className="text-base">
                        Incoming Mail (IMAP)
                      </CardTitle>
                    </div>
                    <CardDescription>
                      Configure where to read emails from.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="imap-host">IMAP Host</Label>
                      <Input
                        id="imap-host"
                        placeholder="imap.gmail.com"
                        defaultValue="imap.gmail.com"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="imap-port">Port</Label>
                        <Input
                          id="imap-port"
                          placeholder="993"
                          defaultValue="993"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="imap-encryption">
                          Encryption
                        </Label>
                        <Input
                          id="imap-encryption"
                          defaultValue="SSL/TLS"
                          disabled
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="imap-user">
                        Username / Email
                      </Label>
                      <Input
                        id="imap-user"
                        defaultValue="support@company.com"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="imap-password">
                        Password / App Key
                      </Label>
                      <Input
                        id="imap-password"
                        type="password"
                        defaultValue="••••••••••••"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Outgoing Mail (SMTP) */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-primary" />
                      <CardTitle className="text-base">
                        Outgoing Mail (SMTP)
                      </CardTitle>
                    </div>
                    <CardDescription>
                      Configure how to send replies.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="smtp-host">SMTP Host</Label>
                      <Input
                        id="smtp-host"
                        placeholder="smtp.gmail.com"
                        defaultValue="smtp.gmail.com"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="smtp-port">Port</Label>
                        <Input
                          id="smtp-port"
                          placeholder="587"
                          defaultValue="587"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="smtp-encryption">
                          Encryption
                        </Label>
                        <Input
                          id="smtp-encryption"
                          defaultValue="STARTTLS"
                          disabled
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="smtp-user">
                        Username / Email
                      </Label>
                      <Input
                        id="smtp-user"
                        defaultValue="support@company.com"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="smtp-password">
                        Password / App Key
                      </Label>
                      <Input
                        id="smtp-password"
                        type="password"
                        defaultValue="••••••••••••"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardFooter className="flex items-center justify-between border-t bg-muted/20 px-6 py-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={handleTestConnection}
                      disabled={isTestingConnection}
                    >
                      {isTestingConnection ? "Testing..." : "Test Connection"}
                    </Button>
                    {connectionStatus === "success" && (
                      <span className="flex items-center gap-2 text-sm text-green-600 font-medium animate-in fade-in">
                        <CheckCircle2 className="h-4 w-4" /> Connected
                      </span>
                    )}
                    {connectionStatus === "error" && (
                      <span className="flex items-center gap-2 text-sm text-destructive font-medium animate-in fade-in">
                        <AlertCircle className="h-4 w-4" /> Connection
                        Failed
                      </span>
                    )}
                  </div>
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    {t("settings.save")}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="spam" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-primary" />
                    <CardTitle>{t("settings.spam")}</CardTitle>
                  </div>
                  <CardDescription>
                    Configure rules to automatically ignore emails and
                    prevent ticket creation.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label className="text-base">
                        Enable Smart Filtering
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically block emails with typical marketing
                        headers (e.g., List-Unsubscribe).
                      </p>
                    </div>
                    <Switch checked />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div>
                      <Label className="text-base">
                        Blocked Domains
                      </Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Emails from these domains will never create
                        tickets.
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {[
                          "news.marketing.com",
                          "promo.store.com",
                          "no-reply.service.net",
                        ].map((domain) => (
                          <Badge
                            key={domain}
                            variant="secondary"
                            className="px-3 py-1 text-sm flex items-center gap-2"
                          >
                            {domain}
                            <Trash2 className="h-3 w-3 cursor-pointer hover:text-destructive" />
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add domain (e.g., newsletter.com)"
                          className="max-w-md"
                        />
                        <Button variant="secondary">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-base">
                        Subject Line Keywords
                      </Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Block emails containing these words in the
                        subject line.
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {[
                          "newsletter",
                          "promotion",
                          "discount",
                          "offer",
                          "sale",
                        ].map((keyword) => (
                          <Badge
                            key={keyword}
                            variant="outline"
                            className="px-3 py-1 text-sm flex items-center gap-2 border-dashed"
                          >
                            {keyword}
                            <Trash2 className="h-3 w-3 cursor-pointer hover:text-destructive" />
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add keyword (e.g., black friday)"
                          className="max-w-md"
                        />
                        <Button variant="secondary">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/20 px-6 py-4">
                  <Button onClick={handleSave}>
                    {t("settings.save")}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="team" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle>{t("settings.team")}</CardTitle>
                    <CardDescription>
                      Manage agents and their permissions.
                    </CardDescription>
                  </div>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Agent
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Agent</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingTeam && (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="py-6 text-center text-sm text-muted-foreground"
                          >
                            Loading team members...
                          </TableCell>
                        </TableRow>
                      )}

                      {teamError && !isLoadingTeam && (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="py-6 text-center text-sm text-red-500"
                          >
                            Failed to load team members.
                          </TableCell>
                        </TableRow>
                      )}

                      {!isLoadingTeam &&
                        !teamError &&
                        teamMembers.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="py-6 text-center text-sm text-muted-foreground"
                            >
                              No agents found. Convert users em{" "}
                              <code>profiles</code> com role{" "}
                              <code>agent</code> ou{" "}
                              <code>admin</code>.
                            </TableCell>
                          </TableRow>
                        )}

                      {!isLoadingTeam &&
                        !teamError &&
                        teamMembers.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={member.avatar_url || ""}
                                  />
                                  <AvatarFallback>
                                    {member.full_name
                                      ? member.full_name.charAt(0)
                                      : "?"}
                                  </AvatarFallback>
                                </Avatar>
                                {member.full_name || "Unnamed"}
                              </div>
                            </TableCell>
                            <TableCell>
                              {member.email || "-"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="capitalize"
                              >
                                {member.role || "agent"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                Active
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    Edit Permissions
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    Reset Password
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">
                                    Remove Agent
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
}
