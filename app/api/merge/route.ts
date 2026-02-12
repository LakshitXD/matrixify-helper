import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mergeUpdateIntoSnapshot } from "@/lib/mergeEngine";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 401 });
  }
  let body: {
    snapshotId: string;
    updateHeaders: string[];
    updateRows: Record<string, string>[];
    primaryKey: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }
  const { snapshotId, updateHeaders, updateRows, primaryKey } = body;
  if (!snapshotId || !Array.isArray(updateHeaders) || !Array.isArray(updateRows) || !primaryKey) {
    return NextResponse.json(
      { message: "Missing snapshotId, updateHeaders, updateRows, or primaryKey" },
      { status: 400 }
    );
  }
  const snapshot = await prisma.storeSnapshot.findFirst({
    where: { id: snapshotId, userId: user.id },
  });
  if (!snapshot) {
    return NextResponse.json({ message: "Snapshot not found" }, { status: 404 });
  }
  const snapshotHeaders = snapshot.headers as string[];
  const snapshotRows = snapshot.rows as Record<string, string>[];
  try {
    const result = mergeUpdateIntoSnapshot(
      snapshotRows,
      snapshotHeaders,
      updateRows,
      updateHeaders,
      primaryKey
    );
    return NextResponse.json({
      mergedHeaders: result.mergedHeaders,
      mergedRows: result.mergedRows,
      keysNotFound: result.keysNotFound,
    });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Merge failed" },
      { status: 400 }
    );
  }
}
