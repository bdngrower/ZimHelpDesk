// server/admin-agents.ts
import { supabaseAdmin } from "./supabaseAdmin";

export async function createAgent(input: {
  full_name: string;
  email: string;
  role: "agent" | "admin";
}) {
  const { full_name, email, role } = input;

  if (!full_name || !email) {
    throw new Error("Nome completo e e-mail são obrigatórios.");
  }

  // 1) cria usuário no Auth
  const { data, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: false,
      user_metadata: {
        full_name,
        role,
      },
    });

  if (authError || !data?.user) {
    console.error("Erro ao criar usuário Auth:", authError);
    throw new Error(
      authError?.message ?? "Erro ao criar usuário de autenticação."
    );
  }

  const userId = data.user.id;

  // 2) cria registro em profiles com mesmo id
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
    throw new Error(
      profileError.message ?? "Erro ao criar registro na tabela profiles."
    );
  }

  return { id: userId };
}

export async function deleteAgent(id: string) {
  if (!id) throw new Error("ID do agente é obrigatório.");

  // 1) apaga profile
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .delete()
    .eq("id", id);

  if (profileError) {
    console.error("Erro ao remover profile:", profileError);
    throw new Error(
      profileError.message ?? "Erro ao remover registro na tabela profiles."
    );
  }

  // 2) apaga usuário auth
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

  if (authError) {
    console.error("Erro ao remover usuário Auth:", authError);
    throw new Error(
      authError.message ?? "Erro ao remover usuário de autenticação."
    );
  }

  return { ok: true };
}
