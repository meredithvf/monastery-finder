import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  DISCOVERY_CHAT_TOOL,
  type ChatMessage,
  type DiscoveryChatContext,
} from "@/lib/discovery-profile";
import {
  DISCOVERY_MAX_USER_TURNS,
  discoverySystemPromptForTurn,
} from "@/lib/discovery-prompt";

export async function POST(request: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured. Add OPENAI_API_KEY to .env.local." },
      { status: 500 },
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Messages are required." }, { status: 400 });
  }

  const sanitized = messages.filter(
    (m): m is ChatMessage =>
      m &&
      typeof m.content === "string" &&
      (m.role === "user" || m.role === "assistant") &&
      m.content.trim().length > 0,
  );

  if (sanitized.length === 0) {
    return NextResponse.json({ error: "No valid messages provided." }, { status: 400 });
  }

  const userTurnCount = sanitized.filter((m) => m.role === "user").length;
  if (userTurnCount > DISCOVERY_MAX_USER_TURNS) {
    return NextResponse.json(
      { error: `Discovery chat allows at most ${DISCOVERY_MAX_USER_TURNS} replies.` },
      { status: 400 },
    );
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: discoverySystemPromptForTurn(userTurnCount) },
        ...sanitized.map((m) => ({ role: m.role, content: m.content })),
      ],
      tools: [DISCOVERY_CHAT_TOOL],
      tool_choice: userTurnCount >= DISCOVERY_MAX_USER_TURNS ? "required" : "auto",
    });

    const choice = completion.choices[0];
    if (!choice?.message) {
      return NextResponse.json({ error: "No response from the model." }, { status: 502 });
    }

    let chatContext: DiscoveryChatContext | null = null;
    const toolCalls = choice.message.tool_calls;

    if (toolCalls?.length) {
      for (const call of toolCalls) {
        if (call.type !== "function" || call.function.name !== "submit_discovery_context") {
          continue;
        }
        try {
          chatContext = JSON.parse(call.function.arguments) as DiscoveryChatContext;
        } catch {
          return NextResponse.json(
            { error: "Failed to parse discovery context from the model." },
            { status: 502 },
          );
        }
      }
    }

    const reply =
      choice.message.content?.trim() ||
      (chatContext
        ? "Thank you for sharing so openly. Tune the sliders below, then we will shape your profile."
        : "Thank you for sharing. Tell me a bit more when you are ready.");

    return NextResponse.json({ reply, chatContext });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Discovery chat request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
