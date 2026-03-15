import { NextRequest, NextResponse } from "next/server";

/**
 * Claude API proxy route.
 * Forwards requests to Anthropic's API using the visitor's key
 * from sessionStorage (injected as x-api-key header).
 *
 * In mock mode (default), this route is not called.
 * In live mode, set PASSOFF_MODE=live and provide ANTHROPIC_API_KEY.
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey =
      request.headers.get("x-api-key") ||
      process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "No API key provided. Set ANTHROPIC_API_KEY or pass x-api-key header." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to proxy request to Claude API" },
      { status: 500 }
    );
  }
}
