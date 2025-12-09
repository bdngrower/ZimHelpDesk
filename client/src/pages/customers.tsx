import Layout from "@/components/layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Search,
  Mail,
  MoreHorizontal,
  Plus,
  AlertCircle,
  Phone,
  MapPin,
} from "lucide-react";
import { useLanguage } from "@/context/language-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

type Customer = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  avatar_url: string | null;
  cnpj: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  created_at: string | null;
};

export default function CustomersPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCnpj, setNewCnpj] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newPostalCode, setNewPostalCode] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  // Carrega clientes reais do Supabase (profiles.role = 'customer')
  const {
    data: customers = [],
    isLoading,
    error,
  } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, email, role, avatar_url, cnpj, phone, address_line1, address_line2, city, state, postal_code, country, created_at",
        )
        .eq("role", "customer")
        .order("full_name", { ascending: true });

      if (error) throw error;
      return (data ?? []) as Customer[];
    },
  });

  // Filtro de busca (nome, email, CNPJ, cidade)
  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const s = search.toLowerCase();
    return customers.filter((c) => {
      const name = c.full_name?.toLowerCase() ?? "";
      const email = c.email?.toLowerCase() ?? "";
      const cnpj = c.cnpj?.toLowerCase() ?? "";
      const city = c.city?.toLowerCase() ?? "";
      return (
        name.includes(s) ||
        email.includes(s) ||
        cnpj.includes(s) ||
        city.includes(s)
      );
    });
  }, [customers, search]);

  // Mutação para criar novo cliente
  const createCustomerMutation = useMutation({
    mutationFn: async (payload: {
      full_name: string;
      email: string;
      cnpj?: string;
      phone?: string;
      address_line1?: string;
      city?: string;
      state?: string;
      postal_code?: string;
    }) => {
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          full_name: payload.full_name,
          email: payload.email,
          role: "customer",
          cnpj: payload.cnpj || null,
          phone: payload.phone || null,
          address_line1: payload.address_line1 || null,
          city: payload.city || null,
          state: payload.state || null,
          postal_code: payload.postal_code || null,
        })
        .select("id")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setNewName("");
      setNewEmail("");
      setNewCnpj("");
      setNewPhone("");
      setNewAddress("");
      setNewCity("");
      setNewState("");
      setNewPostalCode("");
      setFormError(null);
      setIsDialogOpen(false);
      toast({
        title: "Cliente criado",
        description: "O cliente foi adicionado com sucesso.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Erro ao criar cliente",
        description: err?.message ?? "Não foi possível criar o cliente.",
        variant: "destructive",
      });
    },
  });

  function handleSubmitNewCustomer(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!newName.trim() || !newEmail.trim()) {
      setFormError("Informe pelo menos nome e e-mail.");
      return;
    }

    createCustomerMutation.mutate({
      full_name: newName.trim(),
      email: newEmail.trim(),
      cnpj: newCnpj.trim() || undefined,
      phone: newPhone.trim() || undefined,
      address_line1: newAddress.trim() || undefined,
      city: newCity.trim() || undefined,
      state: newState.trim() || undefined,
      postal_code: newPostalCode.trim() || undefined,
    });
  }

  const buildAddress = (c?: Customer | null) => {
    if (!c) return "";
    const parts = [
      c.address_line1,
      c.address_line2,
      c.city,
      c.state,
      c.postal_code,
      c.country,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const mapsUrl =
    selectedCustomer && buildAddress(selectedCustomer)
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          buildAddress(selectedCustomer),
        )}`
      : undefined;

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
              {t("customers.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("customers.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="transition-transform duration-150 hover:scale-[1.02]">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                  <DialogTitle>Add Customer</DialogTitle>
                  <DialogDescription>
                    Crie um novo cliente no sistema. Isso cria apenas o
                    registro em <code>profiles</code> com role{" "}
                    <code>customer</code>.
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={handleSubmitNewCustomer}
                  className="space-y-4 pt-2"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="customer-name">Name</Label>
                      <Input
                        id="customer-name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Nome do cliente"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="customer-email">Email</Label>
                      <Input
                        id="customer-email"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="cliente@empresa.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="customer-cnpj">CNPJ</Label>
                      <Input
                        id="customer-cnpj"
                        value={newCnpj}
                        onChange={(e) => setNewCnpj(e.target.value)}
                        placeholder="00.000.000/0001-00"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="customer-phone">Telefone</Label>
                      <Input
                        id="customer-phone"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="(11) 99999-0000"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2 md:col-span-2">
                      <Label htmlFor="customer-address">
                        Endereço
                      </Label>
                      <Input
                        id="customer-address"
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        placeholder="Rua, número, complemento"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="customer-city">Cidade</Label>
                      <Input
                        id="customer-city"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        placeholder="São Paulo"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="customer-state">Estado</Label>
                      <Input
                        id="customer-state"
                        value={newState}
                        onChange={(e) => setNewState(e.target.value)}
                        placeholder="SP"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="customer-zip">CEP</Label>
                      <Input
                        id="customer-zip"
                        value={newPostalCode}
                        onChange={(e) =>
                          setNewPostalCode(e.target.value)
                        }
                        placeholder="00000-000"
                      />
                    </div>
                  </div>

                  {formError && (
                    <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={createCustomerMutation.isLoading}
                    >
                      {createCustomerMutation.isLoading
                        ? "Salvando..."
                        : "Salvar"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="shadow-sm transition-shadow duration-150 hover:shadow-md">
          <CardHeader className="border-b bg-muted/40 px-6 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  className="w-full bg-background pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/60">
                  <TableHead className="w-[260px]">Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-6 text-center text-sm text-muted-foreground"
                    >
                      Loading customers...
                    </TableCell>
                  </TableRow>
                )}

                {error && !isLoading && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-6 text-center text-sm text-red-500"
                    >
                      Failed to load customers.
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  !error &&
                  filteredCustomers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="group cursor-pointer transition-colors hover:bg-muted/40"
                      onClick={() => setSelectedCustomer(user)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border shadow-sm group-hover:shadow-md transition-shadow">
                            <AvatarImage src={user.avatar_url || ""} />
                            <AvatarFallback>
                              {user.full_name
                                ? user.full_name.charAt(0)
                                : "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-foreground">
                              {user.full_name || "Unnamed"}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              {user.created_at && (
                                <span>
                                  Cliente desde{" "}
                                  {new Date(
                                    user.created_at,
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Mail className="h-3.5 w-3.5" />
                          {user.email || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Phone className="h-3.5 w-3.5" />
                          {user.phone || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.cnpj || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.city || user.state
                          ? [user.city, user.state]
                              .filter(Boolean)
                              .join(" / ")
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-muted rounded-full"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setSelectedCustomer(user)}
                            >
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              View Tickets
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Block User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}

                {!isLoading &&
                  !error &&
                  filteredCustomers.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-6 text-center text-sm text-muted-foreground"
                      >
                        No customers found.
                      </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog de detalhes do cliente */}
        <Dialog
          open={!!selectedCustomer}
          onOpenChange={(open) => !open && setSelectedCustomer(null)}
        >
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
              <DialogDescription>
                Informações completas do cliente.
              </DialogDescription>
            </DialogHeader>
            {selectedCustomer && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage
                      src={selectedCustomer.avatar_url || ""}
                    />
                    <AvatarFallback>
                      {selectedCustomer.full_name
                        ? selectedCustomer.full_name.charAt(0)
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {selectedCustomer.full_name || "Unnamed"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedCustomer.email || "-"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      Telefone
                    </span>
                    <span className="font-medium">
                      {selectedCustomer.phone || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">CNPJ</span>
                    <span className="font-medium">
                      {selectedCustomer.cnpj || "-"}
                    </span>
                  </div>
                  {selectedCustomer.created_at && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">
                        Cliente desde
                      </span>
                      <span className="font-medium">
                        {new Date(
                          selectedCustomer.created_at,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Endereço</span>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {buildAddress(selectedCustomer) || "-"}
                  </p>
                  {mapsUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1"
                      asChild
                    >
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver no mapa
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
