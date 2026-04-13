import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // ── Vercel Blob (production) ─────────────────────────────────────────────
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import("@vercel/blob");
      const blob = await put(`fleet/${filename}`, buffer, {
        access: "public",
        contentType: file.type,
      });
      return NextResponse.json({ url: blob.url });
    }

    // ── Local filesystem (development) ────────────────────────────────────────
    const uploadsDir = join(process.cwd(), "public", "uploads");
    mkdirSync(uploadsDir, { recursive: true });
    writeFileSync(join(uploadsDir, filename), buffer);
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
