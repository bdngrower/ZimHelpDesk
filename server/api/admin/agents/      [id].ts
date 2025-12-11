// server/api/admin/agents/[id].ts
import type { IncomingMessage, ServerResponse } from "http";
import { deleteAgent } from "../../admin-agents";

type Req = IncomingMessage & { method?: string; url?: string };
type Res = ServerResponse;

export default async function handler(req: Req, res: Res) {
  if (req.method !== "DELETE") {
    res.statusCode = 405;
    res.setHeader("Allow", "DELETE");
    res.end("Method Not Allowed");
    return;
  }

  try {
    // pega o id a partir da URL: /api/admin/agents/:id
    const url = new URL(req.url || "", "http://localhost");
    const parts = url.pathname.split("/");
    const id = parts[parts.length - 1];

    if (!id) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "ID do agente é obrigatório." }));
      return;
    }

    await deleteAgent(id);

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: true }));
  } catch (e: any) {
    console.error("Erro inesperado ao remover agente:", e);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: e?.message ?? "Erro inesperado ao remover agente.",
      })
    );
  }
}
