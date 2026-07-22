import { NextRequest, NextResponse } from "next/server";
import { chatAIAction } from "@/action/chat.ai";

// ── CORS helpers ──────────────────────────────────────────────────────────────
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// Handle pre-flight requests from embedded widgets on other origins
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

// ── POST /api/chat ────────────────────────────────────────────────────────────
// Called by the embedded widget.js on third-party websites.
// Body: { message, siteId (collection name), uniqueId (model id), sessionId }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, siteId, uniqueId, sessionId } = body as {
      message: string;
      siteId: string;   // Qdrant collection name
      uniqueId: string; // models.id — used for usage tracking
      sessionId?: string;
    };

    // Basic validation
    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400, headers: corsHeaders() }
      );
    }
    if (!siteId || !uniqueId) {
      return NextResponse.json(
        { error: "siteId and uniqueId are required." },
        { status: 400, headers: corsHeaders() }
      );
    }

    // siteId IS the collection name (matches how /embed/page.tsx uses it)
    const reply = await chatAIAction(
      message,
      siteId,          // collection name → Qdrant
      uniqueId,        // model id → usage tracking
      sessionId ?? "widget-session"
    );

    return NextResponse.json({ reply }, { status: 200, headers: corsHeaders() });
  } catch (err) {
    console.error("[/api/chat] Error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500, headers: corsHeaders() }
    );
  }
}
