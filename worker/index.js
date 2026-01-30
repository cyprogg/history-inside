import { makeSSML } from "./ssml";

export default {
  async fetch(req) {
    const url = new URL(req.url);
    const body = await req.json();

    if (url.pathname === "/split") {
      const cuts = body.script.split("\n\n");
      return new Response(JSON.stringify(cuts));
    }

    if (url.pathname === "/ssml") {
      return new Response(makeSSML(body.text));
    }

    if (url.pathname === "/prompt") {
      return new Response(
        `${body.text}, 18th century copperplate engraving, monochrome`
      );
    }

    return new Response("Not Found", { status: 404 });
  },
};
