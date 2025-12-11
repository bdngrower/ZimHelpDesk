import { Router } from "express";
import { supabaseAdmin } from "../supabase-admin";

export const adminAgentsRouter = Router();

// LISTAR AGENTES
adminAgentsRouter.get("/", async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .in("role", ["admin", "agent"]);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// CRIAR AGENTE (Auth + Profiles)
adminAgentsRouter.post("/", async (req, res) => {
  const { full_name, email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // cria usuário no Auth
  const { data: user, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: true,
  });

  if (authError) return res.status(500).json({ error: authError.message });

  const userId = user.user.id;

  // cria profile
  const { error: profileError } = await supabaseAdmin.from("profiles").insert({
    id: userId,
    full_name,
    email,
    role,
  });

  if (profileError) return res.status(500).json({ error: profileError.message });

  res.json({ success: true });
});

// REMOVER AGENTE
adminAgentsRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  // Deleta do Auth
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (authError) return res.status(500).json({ error: authError.message });

  // Deleta do Profiles
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .delete()
    .eq("id", id);

  if (profileError) return res.status(500).json({ error: profileError.message });

  res.json({ success: true });
});
