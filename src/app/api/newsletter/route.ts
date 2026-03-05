import { NextResponse } from "next/server";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const { email, locale } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      // In development without API key, just acknowledge
      console.log(`[Newsletter] Subscription request: ${email} (${locale})`);
      return NextResponse.json({ success: true, status: "dev-mode" });
    }

    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        attributes: {
          LOCALE: locale || "en",
          SOURCE: "website",
          SIGNUP_DATE: new Date().toISOString(),
        },
        updateEnabled: true,
      }),
    });

    if (response.status === 201 || response.status === 204) {
      return NextResponse.json({ success: true });
    }

    const error = await response.text();
    console.error("[Newsletter] Brevo error:", error);
    return NextResponse.json(
      { error: "Subscription failed" },
      { status: 500 }
    );
  } catch (error) {
    console.error("[Newsletter] Error:", error);
    return NextResponse.json(
      { error: "Subscription failed" },
      { status: 500 }
    );
  }
}
