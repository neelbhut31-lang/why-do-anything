import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Page ID required" }, { status: 400 });
    }

    await db.page.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to increment view count" }, { status: 500 });
  }
}
