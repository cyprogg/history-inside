import { makeMetadataFromCuts } from "./metadata.js";
import { nextTopics } from "./roadmap.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function validateScript(text) {
  const errors = [];
  const warnings = [];

  const banned = ["충격", "소름", "대박", "레전드"];
  const absolutes = ["반드시", "무조건", "절대"];

  for (const w of banned) if (text.includes(w)) errors.push(`금지어 사용: ${w}`);
  if ((text.match(/!/g) || []).length > 3) errors.push("느낌표 과다 사용");

  let absCount = 0;
  for (const w of absolutes) if (text.includes(w)) absCount++;
  if (absCount >= 2) warnings.push("단정 표현 과다");

  return { errors, warnings };
}

function splitScriptToCuts(text) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);

  return paragraphs.map((p, i) => ({
    id: i + 1,
    type: i === 0 ? "hook" : i === paragraphs.length - 1 ? "ending" : "body",
    text: p
  }));
}

export default {
  async fetch(req) {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    const url = new URL(req.url);

    if (req.method === "GET" && url.pathname === "/") {
      return new Response("OK", { headers: corsHeaders });
    }

    if (req.method === "POST" && url.pathname === "/validate") {
      const { text } = await req.json();
      const result = validateScript(text || "");
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (req.method === "POST" && url.pathname === "/split") {
      const { text } = await req.json();
      const cuts = splitScriptToCuts(text || "");
      return new Response(JSON.stringify({ cuts }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (req.method === "POST" && url.pathname === "/metadata") {
      const { cuts } = await req.json();
      const meta = makeMetadataFromCuts(cuts || []);
      return new Response(JSON.stringify(meta), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (req.method === "POST" && url.pathname === "/roadmap-next") {
      const { history, pool } = await req.json();
      const next = nextTopics({ history, pool });
      return new Response(JSON.stringify({ next }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  }
};
