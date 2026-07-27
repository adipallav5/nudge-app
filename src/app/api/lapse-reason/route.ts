import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const reason = searchParams.get("reason");
    const stageStr = searchParams.get("stage");

    if (!token || !reason || !stageStr) {
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    const stage = parseInt(stageStr, 10);
    if (isNaN(stage)) {
      return new NextResponse("Invalid stage parameter", { status: 400 });
    }

    // Ensure user exists
    const user = await prisma.user.findUnique({
      where: { id: token }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Save the lapse reason
    await prisma.lapseReason.create({
      data: {
        userId: user.id,
        reason,
        nudgeStage: stage,
      }
    });

    // Return a simple HTML page acknowledging the feedback
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Feedback Received</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f9fafb; margin: 0; }
          .container { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
          h1 { color: #111827; margin-bottom: 0.5rem; }
          p { color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Got it.</h1>
          <p>Thanks for letting us know. Tomorrow is a new day.</p>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" }
    });
  } catch (error) {
    console.error("Lapse reason API error:", error);
    return new NextResponse("Something went wrong", { status: 500 });
  }
}
