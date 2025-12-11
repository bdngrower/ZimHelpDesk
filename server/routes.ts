import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { supabaseAdmin } from "./supabaseAdmin"; // <- usa o client com service role

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // todas as rotas devem começar com /api

  // Criar agente: cria usuário no Auth + registro em profiles
  app.post("/api/admin/agents", async (req, res) => {
    const { full_name, email, role } = req.body as {
      full_name: string;
      email: string;
      role: "agent" | "admin";
    };

    if (!full_name || !email) {
      return res.status(400).json({
        error: "Nome completo e e-mail são obrigatórios.",
      });
    }

    try {
      // 1) cria usuário no Auth
      const { data, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: false, // Supabase decide o fluxo de e-mail conforme config
          user_metadata: {
            full_name,
            role,
          },
        });

      if (authError || !data?.user) {
        console.error("Erro ao criar usuário Auth:", authError);
        return res.status(400).json({
          error: authError?.message ?? "Erro ao criar usuário de autenticação.",
        });
      }

      const userId = data.user.id;

      // 2) cria registro em profiles com mesmo id do usuário auth
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: userId,
          full_name,
          email,
          role,
        });

      if (profileError) {
        console.error("Erro ao criar profile:", profileError);
        return res.status(400).json({
          error:
            profileError.message ?? "Erro ao criar registro na tabela profiles.",
        });
      }

      return res.status(200).json({ id: userId });
    } catch (e: any) {
      console.error("Erro inesperado ao criar agente:", e);
      return res
        .status(500)
        .json({ error: e?.message ?? "Erro inesperado ao criar agente." });
    }
  });

  // Remover agente: remove profile + usuário Auth
  app.delete("/api/admin/agents/:id", async (req, res) => {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID do agente é obrigatório." });
    }

    try {
      // 1) apaga profile
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .delete()
        .eq("id", id);

      if (profileError) {
        console.error("Erro ao remover profile:", profileError);
        return res.status(400).json({
          error:
            profileError.message ??
            "Erro ao remover registro na tabela profiles.",
        });
      }

      // 2) apaga usuário de auth
      const { error: authError } =
        await supabaseAdmin.auth.admin.deleteUser(id);

      if (authError) {
        console.error("Erro ao remover usuário Auth:", authError);
        return res.status(400).json({
          error:
            authError.message ?? "Erro ao remover usuário de autenticação.",
        });
      }

      return res.status(200).json({ ok: true });
    } catch (e: any) {
      console.error("Erro inesperado ao remover agente:", e);
      return res
        .status(500)
        .json({ error: e?.message ?? "Erro inesperado ao remover agente." });
    }
  });

  return httpServer;
}
