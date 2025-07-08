// /api/chatbot/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json(); // Expecting a single string, not array

    const API_KEY = process.env.OPENROUTER_API_KEY;
    if (!API_KEY) throw new Error("API key not set");

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "X-Title": "QuickGig AI",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content: `
You are QuickGig AI — a helpful assistant for a freelance marketplace called QuickGig.
QuickGig is a platform where:
- Clients can post gigs (job listings with budget, deadline, etc.)
- Freelancers can apply to those gigs
- Gigs can be tracked as open, in progress, or closed
You answer user questions, help freelancers and clients with actions like applying, withdrawing, understanding profiles, and give app-specific help.
If a user asks for something outside this scope, politely redirect them to relevant areas.

Only answer questions related to QuickGig features like:
- Posting or applying to gigs
- Managing profiles
- Application status
- Using the dashboard

Do NOT respond with long intros or full tutorials unless explicitly asked.

Keep responses brief, helpful, and conversational.
If someone just says "hi", reply casually like "Hey! Need help with gigs or your profile?" and don’t go into long explanations.
            `.trim(),
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    const data = await res.json();

    const reply =
      data.choices?.[0]?.message?.content ||
      "Sorry, I didn’t get that. Try rephrasing your question.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chatbot API error:", err);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
