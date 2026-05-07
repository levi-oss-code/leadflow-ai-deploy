import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
  const { leadName, leadTitle, leadCompany, channel, tone, context } = await req.json();

  if (!openai) {
    const templates: Record<string, string> = {
      email: `Subject: Excited to connect, ${leadName}\n\nHi ${leadName},\n\nI hope this email finds you well. I came across ${leadCompany || "your company"} and was impressed by your work as ${leadTitle || "a leader in your field"}.\n\nI'd love to explore how we might collaborate. Would you be open to a brief call next week?\n\nBest regards,\n[Your Name]`,
      linkedin: `Hi ${leadName},\n\nI noticed your profile and your role at ${leadCompany || "your company"}. I'm reaching out because I believe there's a strong synergy between what you're building and our solution.\n\nWould love to connect and share ideas.`,
      twitter: `Hey ${leadName.split(" ")[0]} 👋 Love what ${leadCompany || "you"} are building! Would love to connect and potentially collaborate.`,
      sms: `Hi ${leadName}, this is [Your Name]. I saw ${leadCompany || "your company"} online and think we could help with [value prop]. Quick chat this week?`,
    };
    return NextResponse.json({ content: templates[channel] || templates.email, subject: `Quick question, ${leadName}`, mock: true });
  }

  const prompt = `Write a personalized outreach message for ${leadName} who is ${leadTitle || "a professional"} at ${leadCompany || "their company"}. The channel is ${channel}. Tone: ${tone}. ${context ? `Context: ${context}` : ""}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are an expert sales outreach copywriter. Write concise, personalized, and compelling messages." },
      { role: "user", content: prompt },
    ],
    max_tokens: 500,
  });

  const content = completion.choices[0].message.content ?? "";

  let subject = "";
  if (channel === "email") {
    const subj = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Write short, compelling email subject lines under 60 characters." },
        { role: "user", content: `Subject line for outreach to ${leadName} at ${leadCompany || "their company"}` },
      ],
      max_tokens: 60,
    });
    subject = subj.choices[0].message.content?.replace(/"/g, "") ?? "Quick follow-up";
  }

  return NextResponse.json({ content, subject, mock: false });
}
