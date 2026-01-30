import { optimizeForEdgeTTS } from "./tts_text.js";
import { makeEngravingPrompt } from "./prompt.js";
import { splitScriptToCuts } from "./split.js";
import { validateScript } from "./validate.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default {
  async fetch(req) {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(req.url);

    // Health check
    if (req.method === "GET" && url.pathname === "/") {
      return new Response("OK", { headers: corsHeaders });
    }

    if (req.method === "POST" && url.pathname === "/validate") {
      const { text } = await req.json();
      const result = validateScript(text);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (req.method === "POST" && url.pathname === "/split") {
      const { text } = await req.json();
      const cuts = splitScriptToCuts(text);
      return new Response(JSON.stringify({ cuts }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (req.method === "POST" && url.pathname === "/tts-text") {
      const { cuts } = await req.json();
      const processed = cuts.map(c => ({
        id: c.id,
        type: c.type,
        tts_text: optimizeForEdgeTTS(c.text, c.type)
      }));
      return new Response(JSON.stringify({ processed }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (req.method === "POST" && url.pathname === "/prompt") {
      const { cuts } = await req.json();
      const prompts = cuts.map(makeEngravingPrompt);
      return new Response(JSON.stringify({ prompts }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  }
};
