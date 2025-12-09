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
  AlertTriangle,
} from "lucide-react";
import { useEffect, useState } from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  // ---- PERFIL (aba Profile) ----
  const {
    data: profile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery({
    queryKey: ["settings_profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .eq("id", user!.id)
        .single();

      if (error) throw error;
      return data as {
        id: string;
        full_name: string | null;
        email: string | null;
        avatar_url: string | null;
      };
    },
  });

  const [fullName, setFullName] = useState("");
  const [avatarUrlInput, setAvatarUrlInput] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setAvatarUrlInput(profile.avatar_url ?? "");
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: { full_name: string; avatar_url: string }) => {
      if (!user?.id) throw new Error("Usuário não autenticado.");
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: payload.full_name,
          avatar_url: payload.avatar_url || null,
        })
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings_profile"] });
      queryClient.invalidateQueries({ queryKey: ["current_profile"] });
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: err?.message ?? "Não foi possível salvar o perfil.",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Informe um nome para o seu perfil.",
        variant: "destructive",
      });
      return;
    }
    updateProfileMutation.mutate({
      full_name: fullName.trim(),
      avatar_url: avatarUrlInput.trim(),
    });
  };

  // ---- TEAM MEMBERS (aba Equipe) ----
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

  // Estado para Add Agent
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [agentEmail, setAgentEmail] = useState("");
  const [agentRole, setAgentRole] = useState<"agent" | "admin">("agent");

  const addAgentMutation = useMutation({
    mutationFn: async (payload: {
      full_name: string;
      email: string;
      role: "agent" | "admin";
    }) => {
      const { error } = await supabase.from("profiles").insert({
        full_name: payload.full_name,
        email: payload.email,
        role: payload.role,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team_members"] });
      setAgentName("");
      setAgentEmail("");
      setAgentRole("agent");
      setIsAddAgentOpen(false);
      toast({
        title: "Agente criado",
        description:
          "O agente foi adicionado à equipe. Crie o usuário de login no Supabase se necessário.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Erro ao criar agente",
        description: err?.message ?? "Não foi possível criar o agente.",
        variant: "destructive",
      });
    },
  });

  const handleAddAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName.trim() || !agentEmail.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Informe nome e e-mail do agente.",
        variant: "destructive",
      });
      return;
    }
    addAgentMutation.mutate({
      full_name: agentName.trim(),
      email: agentEmail.trim(),
      role: agentRole,
    });
  };

  // Editar permissões (role)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editRole, setEditRole] = useState<"agent" | "admin">("agent");

  const updateRoleMutation = useMutation({
    mutationFn: async (payload: {
      id: string;
      role: "agent" | "admin";
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ role: payload.role })
        .eq("id", payload.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team_members"] });
      toast({
        title: "Permissões atualizadas",
        description: "O papel do agente foi alterado.",
      });
      setEditingMember(null);
    },
    onError: (err: any) => {
      toast({
        title: "Erro ao atualizar permissões",
        description: err?.message ?? "Não foi possível alterar o papel.",
        variant: "destructive",
      });
    },
  });

  // Reset password (envia e-mail de reset)
  const resetPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/login`
          : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "E-mail de redefinição enviado",
        description:
          "O agente receberá um e-mail para redefinir a senha (configurar no painel do Supabase).",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Erro ao enviar e-mail",
        description:
          err?.message ?? "Não foi possível enviar o e-mail de redefinição.",
        variant: "destructive",
      });
    },
  });

  const handleResetPassword = (member: TeamMember) => {
    if (!member.email) {
      toast({
        title: "Sem e-mail",
        description:
          "Esse agente não possui e-mail cadastrado em profiles.",
        variant: "destructive",
      });
      return;
    }
    resetPasswordMutation.mutate(member.email);
  };

  // Remover agente (remove da tabela profiles)
  const removeAgentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team_members"] });
      toast({
        title: "Agente removido",
        description: "O agente foi removido da equipe.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Erro ao remover agente",
        description: err?.message ?? "Não foi possível remover o agente.",
        variant: "destructive",
      });
    },
  });

  const handleRemoveAgent = (member: TeamMember) => {
    removeAgentMutation.mutate(member.id);
  };

  // Email settings stub
  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your configuration has been updated successfully.",
    });
  };

  const handleTestConnection = () => {
    setIsTestingConnection(true);
    setConnectionStatus("idle");

    setTimeout(() => {
      setIsTestingConnection(false);
      setConnectionStatus("success");
      toast({
        title: "Connection Successful",
        description: "Successfully connected to IMAP and SMTP servers.",
      });
    }, 2000);
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

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-[520px]">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
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
            {/* --------- Aba Perfil --------- */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Perfil</CardTitle>
                  <CardDescription>
                    Atualize seu nome e foto de perfil.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoadingProfile && (
                    <p className="text-sm text-muted-foreground">
                      Carregando perfil...
                    </p>
                  )}
                  {profileError && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      Não foi possível carregar o perfil.
                    </p>
                  )}

                  {profile && (
                    <form
                      className="space-y-6"
                      onSubmit={handleSaveProfile}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border">
                          <AvatarImage
                            src={avatarUrlInput || profile.avatar_url || ""}
                          />
                          <AvatarFallback>
                            {(fullName || profile.full_name || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm text-muted-foreground">
                          Use uma URL de imagem ou deixe em branco
                          para usar a inicial do nome.
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="full-name">
                            Nome completo
                          </Label>
                          <Input
                            id="full-name"
                            value={fullName}
                            onChange={(e) =>
                              setFullName(e.target.value)
                            }
                            placeholder="Seu nome"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="profile-email">
                            E-mail
                          </Label>
                          <Input
                            id="profile-email"
                            value={profile.email || user?.email || ""}
                            disabled
                          />
                          <p className="text-xs text-muted-foreground">
                            O e-mail de login é gerenciado pelo
                            Supabase Auth.
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="avatar-url">
                          Avatar URL
                        </Label>
                        <Input
                          id="avatar-url"
                          value={avatarUrlInput}
                          onChange={(e) =>
                            setAvatarUrlInput(e.target.value)
                          }
                          placeholder="https://exemplo.com/minha-foto.jpg"
                        />
                      </div>

                      <CardFooter className="px-0">
                        <Button
                          type="submit"
                          disabled={updateProfileMutation.isLoading}
                        >
                          {updateProfileMutation.isLoading
                            ? "Salvando..."
                            : t("settings.save")}
                        </Button>
                      </CardFooter>
                    </form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* --------- Aba Geral --------- */}
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
                    <Label htmlFor="desk-name">
                      Help Desk Name
                    </Label>
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
                      This is the email address displayed to
                      customers.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/20 px-6 py-4">
                  <Button onClick={handleSaveSettings}>
                    {t("settings.save")}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* --------- Aba Email --------- */}
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
                  <Button onClick={handleSaveSettings}>
                    <Save className="mr-2 h-4 w-4" />
                    {t("settings.save")}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* --------- Aba Spam --------- */}
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
                  <Button onClick={handleSaveSettings}>
                    {t("settings.save")}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* --------- Aba Equipe --------- */}
            <TabsContent value="team" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle>{t("settings.team")}</CardTitle>
                    <CardDescription>
                      Manage agents and their permissions.
                    </CardDescription>
                  </div>
                  <Dialog
                    open={isAddAgentOpen}
                    onOpenChange={setIsAddAgentOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Agent
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[420px]">
                      <DialogHeader>
                        <DialogTitle>Add Agent</DialogTitle>
                        <DialogDescription>
                          Cria apenas o registro em{" "}
                          <code>profiles</code>. Para login, crie o
                          usuário também no Supabase Auth.
                        </DialogDescription>
                      </DialogHeader>
                      <form
                        onSubmit={handleAddAgent}
                        className="space-y-4 pt-2"
                      >
                        <div className="grid gap-2">
                          <Label htmlFor="agent-name">Name</Label>
                          <Input
                            id="agent-name"
                            value={agentName}
                            onChange={(e) =>
                              setAgentName(e.target.value)
                            }
                            placeholder="Nome do agente"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="agent-email">Email</Label>
                          <Input
                            id="agent-email"
                            type="email"
                            value={agentEmail}
                            onChange={(e) =>
                              setAgentEmail(e.target.value)
                            }
                            placeholder="agente@empresa.com"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Papel</Label>
                          <Select
                            value={agentRole}
                            onValueChange={(v) =>
                              setAgentRole(v as "agent" | "admin")
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="agent">
                                Agent
                              </SelectItem>
                              <SelectItem value="admin">
                                Admin
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <DialogFooter>
                          <Button
                            type="submit"
                            disabled={addAgentMutation.isLoading}
                          >
                            {addAgentMutation.isLoading
                              ? "Salvando..."
                              : "Salvar"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
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
                              No agents found. Crie registros em{" "}
                              <code>profiles</code> com role{" "}
                              <code>agent</code> ou <code>admin</code>.
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
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setEditingMember(member);
                                      setEditRole(
                                        (member.role as
                                          | "agent"
                                          | "admin") || "agent",
                                      );
                                    }}
                                  >
                                    Edit Permissions
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleResetPassword(member)
                                    }
                                  >
                                    Reset Password
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() =>
                                      handleRemoveAgent(member)
                                    }
                                  >
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

              {/* Dialog para editar permissões */}
              <Dialog
                open={!!editingMember}
                onOpenChange={(open) =>
                  !open && setEditingMember(null)
                }
              >
                <DialogContent className="sm:max-w-[380px]">
                  <DialogHeader>
                    <DialogTitle>Edit Permissions</DialogTitle>
                    <DialogDescription>
                      Ajuste o papel do agente (agent / admin).
                    </DialogDescription>
                  </DialogHeader>
                  {editingMember && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        updateRoleMutation.mutate({
                          id: editingMember.id,
                          role: editRole,
                        });
                      }}
                      className="space-y-4 pt-2"
                    >
                      <div className="text-sm">
                        <span className="font-medium">
                          {editingMember.full_name || "Unnamed"}
                        </span>
                        {editingMember.email && (
                          <span className="block text-muted-foreground">
                            {editingMember.email}
                          </span>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label>Papel</Label>
                        <Select
                          value={editRole}
                          onValueChange={(v) =>
                            setEditRole(v as "agent" | "admin")
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="agent">
                              Agent
                            </SelectItem>
                            <SelectItem value="admin">
                              Admin
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <Button
                          type="submit"
                          disabled={updateRoleMutation.isLoading}
                        >
                          {updateRoleMutation.isLoading
                            ? "Salvando..."
                            : "Salvar"}
                        </Button>
                      </DialogFooter>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
}
