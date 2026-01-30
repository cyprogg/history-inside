import { optimizeForEdgeTTS } from "./tts_text.js";
import { makeEngravingPrompt } from "./prompt.js";

export default {
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    if (url.pathname === "/tts-text" && req.method === "POST") {
      const { cuts } = await req.json();
      const processed = cuts.map(c => ({
        id: c.id,
        tts_text: optimizeForEdgeTTS(c.text, c.type)
      }));
      return new Response(JSON.stringify({ processed }), { headers: { "Content-Type": "application/json" }});
    }

    if (url.pathname === "/prompt" && req.method === "POST") {
      const { cuts } = await req.json();
      const prompts = cuts.map(makeEngravingPrompt);
      return new Response(JSON.stringify({ prompts }), { headers: { "Content-Type": "application/json" }});
    }

    return new Response("OK");
  }
};