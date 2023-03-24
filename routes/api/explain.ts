import { Handlers } from "$fresh/server.ts";
import { oneLine, stripIndent } from "$common-tags";
import type { CreateCompletionRequest } from "$openai";

const OPENAI_KEY = Deno.env.get("OPENAI_KEY");

export const handler: Handlers = {
  async POST(req) {
    console.log(req);
    const payload = await req.json();
    const context = payload.context ?? '';
    const prompt = "your are a private personal assistant";
    console.log(context);

    if (!context)
      return new Response("", {
        headers: {
          "Content-Type": "text/event-stream",
        },
      });

    const generatedPrompt = stripIndent`
        ${oneLine`${prompt.trim().replace("\n", "")}`}

        Context:"""${context.trim().replace("\n", "")}"""

        Answer:
        `;

    const completionOpts: CreateCompletionRequest = {
      model: "text-davinci-003",
      prompt: generatedPrompt,
      max_tokens: 1000,
      temperature: 0.9,
      stream: true,
    };

    const response = await fetch("https://api.openai.com/v1/completions", {
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(completionOpts),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error(err);
      throw new Error("Failed to create completion", err);
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
      },
    });
  },
};
