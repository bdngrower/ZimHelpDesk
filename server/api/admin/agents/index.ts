// server/api/admin/agents/index.ts
import type { IncomingMessage, ServerResponse } from "http";
import { createAgent } from "../../admin-agents";

type Req = IncomingMessage & { method?: string; url?: string };
type Res = ServerResponse & { json?: (body: any) => void };

export default async function handler(req: Req, res: Res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    res.end("Method Not Allowed");
    return;
  }

  // Vite/Node não parseia body sozinho, então precisamos ler o JSON “na mão”
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", async () => {
    try {
      const parsed = body ? JSON.parse(body) : {};
      const { full_name, email, role } = parsed;

      const result = await createAgent({
        full_name,
        email,
        role: role === "admin" ? "admin" : "agent",
      });

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(result));
    } catch (e: any) {
      console.error("Erro inesperado ao criar agente:", e);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: e?.message ?? "Erro inesperado ao criar agente.",
        })
      );
    }
  });
}
