import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  DISCOVERY_PROFILE_TOOL,
  type ChatMessage,
  type UserDiscoveryProfile,
} from "@/lib/discovery-profile";
import { DISCOVERY_SYSTEM_PROMPT } from "@/lib/discovery-prompt";

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

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: DISCOVERY_SYSTEM_PROMPT },
        ...sanitized.map((m) => ({ role: m.role, content: m.content })),
      ],
      tools: [DISCOVERY_PROFILE_TOOL],
      tool_choice: "auto",
    });

    const choice = completion.choices[0];
    if (!choice?.message) {
      return NextResponse.json({ error: "No response from the model." }, { status: 502 });
    }

    let profile: UserDiscoveryProfile | null = null;
    const toolCalls = choice.message.tool_calls;

    if (toolCalls?.length) {
      for (const call of toolCalls) {
        if (call.type !== "function" || call.function.name !== "submit_discovery_profile") {
          continue;
        }
        try {
          profile = JSON.parse(call.function.arguments) as UserDiscoveryProfile;
        } catch {
          return NextResponse.json(
            { error: "Failed to parse discovery profile from the model." },
            { status: 502 },
          );
        }
      }
    }

    const reply =
      choice.message.content?.trim() ||
      (profile
        ? "Your discovery profile is ready. Here is what we learned about your path."
        : "Thank you for sharing. Tell me a bit more when you are ready.");

    return NextResponse.json({ reply, profile });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Discovery chat request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
